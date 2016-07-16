import React from 'react'

export default React.createClass({
  getInitialState () {
    var token = window.localStorage['token']
    return {
      isAuthorized: false,
      isChecked: !token,
      login: null,
      name: null,
      token: token
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
        </div>
      </nav>
      <div className='container'>
        {this.props.children}
      </div>
    </div>
  }
})
