import React from 'react'
import axios from 'axios'

export default React.createClass({
  getInitialState () {
    return {
      users: [],
      currentUser: 'admin',
      currentName: 'Админ'
    }
  },
  componentWillMount () {
    this.getUsers()
  },
  getUsers () {
    axios({
      method: 'get',
      url: '/users'
    })
    .then(res => {
      this.setState({
        users: res.data
      })
    })
  },
  randomPermissions () {
    axios({
      method: 'post',
      url: '/randomPermissions'
    })
    .then(res => {
      let cnt = res.data[0].cnt
      window.alert('Установлено ' + cnt + ' разрешений')
    })
  },
  render () {
    return <div>
      <nav className='navbar navbar-inverse navbar-fixed-top' role='navigation'>
        <div className='container'>
          <div className='navbar-header'>
            <button type='button' className='navbar-toggle' data-toggle='collapse' data-target='.navbar-collapse'>
              <span className='sr-only'>Toggle navigation</span>
              <span className='icon-bar'></span>
              <span className='icon-bar'></span>
              <span className='icon-bar'></span>
            </button>
            <a className='navbar-brand' href='#'>Электронный архив</a>
          </div>
          <div className='collapse navbar-collapse'>
            <ul className='nav navbar-nav'>
              <li className='dropdown'>
                <a href='#' className='dropdown-toggle' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false'>Выбрать пользователя ({this.state.currentName})<span className='caret'></span></a>
                <ul className='dropdown-menu'>
                  {this.state.users.map((item, n) => {
                    return <li key={n}
                      onClick={() => this.setState({currentUser: item.Login, currentName: item.Name})}
                      className={item.Login === this.state.currentUser ? 'active' : ''}
                      ><a href='javascript:void(0);'>{item.Name}</a></li>
                  })}
                </ul>
              </li>
              <li onClick={this.randomPermissions}><a href='javascript:void(0);'>Установить случайние разрешения</a></li>
            </ul>
          </div>
        </div>
      </nav>
      <div className='container'>
        {this.props.children}
      </div>
    </div>
  }
})
