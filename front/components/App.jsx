import React from 'react'
import axios from 'axios'
import { Link, browserHistory } from 'react-router'

export default React.createClass({
  getInitialState () {
    return {
      users: [],
      currentUser: 'anonymous',
      currentName: 'Аноним'
    }
  },
  componentWillMount () {
    this.getUsers()
    this.getPermissions()
  },
  /**
   * Получение списка пользователей для выпадающего меню
   */
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
  /**
   * Получение списка разрешений для испльзования везде где нужно
   */
  getPermissions () {
    axios({
      method: 'get',
      url: '/permissionsList'
    })
    .then(res => {
      let permissionsList = res.data.map(item => ({
        Id: item.Id,
        Name: item.Name,
        VarName: item.VarName
      }))
      window.permissionsList = permissionsList
    })
  },
  /**
   * Установка случайных разрешений на все элементы (если лень руками)
   */
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
  addFolder () {
    let folder = window.prompt('Введите имя папки:', '')
    if (folder) {
      axios({
        method: 'post',
        url: '/addDirectory',
        params: {
          folder: folder
        }
      })
      .then(res => {
        browserHistory.push('/admin')
      })
    }
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
                <a href='#' className='dropdown-toggle' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false'>Пользователь ({this.state.currentName})<span className='caret'></span></a>
                <ul className='dropdown-menu'>
                  <li onClick={() => this.setState({currentUser: 'anonymous', currentName: 'Аноним'})}
                    className={this.state.currentUser === 'anonymous' ? 'active' : ''}
                    ><Link to={'anonymous'}>Аноним</Link></li>
                  {this.state.users.map((item, n) => {
                    return <li key={n}
                      onClick={() => this.setState({currentUser: item.Login, currentName: item.Name})}
                      className={item.Login === this.state.currentUser ? 'active' : ''}
                      ><Link to={item.Login}>{item.Name}</Link></li>
                  })}
                </ul>
              </li>
              <li onClick={this.randomPermissions}><a href='javascript:void(0);'>Cлучайные разрешения</a></li>
              <li onClick={this.addFolder}><a href='javascript:void(0);'>Добавить папку</a></li>
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
