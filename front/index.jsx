import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

import App from './components/App'
import {Folder} from './components/Folder'

render((
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Folder} />
      <Route path=':user' component={Folder} />
    </Route>
  </Router>
), document.getElementById('main'))
