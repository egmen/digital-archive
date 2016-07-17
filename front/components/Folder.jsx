import React from 'react'
import axios from 'axios'
import moment from 'moment'
import prettyByte from 'pretty-byte'

export const Folder = React.createClass({
  getInitialState () {
    window.showingFolders = {}
    return {
      folders: {
        root: []
      },
      currentFolder: '',
      currentFolderPath: [],
      files: []
    }
  },
  componentWillMount () {
    this.getTree(this.props.params.user)
  },
  componentWillReceiveProps (history) {
    this.getTree(history.params.user)
  },
  /**
   * Получение дерева папок в зависимости от имени пользователя
   * @param  {String} user Логин пользователя
   */
  getTree (user) {
    axios({
      method: 'get',
      url: '/tree',
      params: {
        user: user
      }
    })
    .then(res => {
      this.setState({
        folders: res.data
      })
    })
    .catch(console.log)
  },
  /**
   * Срабатывает при щелчке на наименование папки (смена текущей папки)
   * @param  {Uuid} Id     Id текущей папки, прилетевший из недр дерева путём всплытия
   * @param  {Array} path  Путь до этой папки для хлебных крошек
   * @return {Array}       Список файлов из папки
   */
  changeFolder (Id, path) {
    axios({
      method: 'get',
      url: '/files',
      params: {
        FolderId: Id
      }
    })
    .then(res => {
      this.setState({
        files: res.data,
        currentFolder: Id,
        currentFolderPath: path
      })
    })
    .catch(console.log)
  },
  render () {
    return <div className='row'>
      <div className='col-md-3 col-sm-5'>
        <br /><br /><br />
        <h3>Список папок</h3>
        {this.state.folders.root.map((Id, n) => {
          return <FolderItem
            key={n}
            folders={this.state.folders}
            Id={Id}
            currentFolder={this.state.currentFolder}
            deep={0}
            changeFolder={this.changeFolder}
          />
        })}
      </div>
      <div className='col-md-7 col-sm-7'>
        <br /><br /><br />
        <Files
          path={this.state.currentFolderPath}
          files={this.state.files}
          changeFolder={this.changeFolder}
          currentFolder={this.state.currentFolder}
        />
      </div>
      <div className='row'>
        <div className='col-md-5 col-sm-7'>
          <FolderPermissions currentFolder={this.state.folders[this.state.currentFolder]}
            Id={this.state.currentFolder} />
        </div>
      </div>
    </div>
  }
})

const FolderItem = React.createClass({
  getInitialState () {
    return {
      showChilds: !!window.showingFolders[this.props.Id]
    }
  },
  /**
   * Действие при нажатии на +/- для показа вложенных папок
   */
  toggleChilds () {
    if (this.state.showChilds) {
      delete window.showingFolders[this.props.Id]
    } else {
      window.showingFolders[this.props.Id] = {}
    }
    this.setState({
      showChilds: !this.state.showChilds
    })
  },
  /**
   * Смена текущей папки, инициирует действие, либо передаёт его вышестоящией
   * одноимённой функции, добавляя свои координаты в переменную path для хлебных крошек
   */
  changeFolder (Id, path) {
    let newPath = {
      Id: this.props.Id,
      Name: this.props.folders[this.props.Id].Name
    }
    // Если задана вторая переменная значит это всплывающее событие
    if (path) {
      path.unshift(newPath)
      this.props.changeFolder(Id, path)
    } else {
      this.props.changeFolder(this.props.Id, [newPath])
    }
  },
  render () {
    let folder = this.props.folders[this.props.Id]
    let activeFolder = this.props.Id === this.props.currentFolder
    return <div>
      <div onDoubleClick={this.toggleChilds} className='row'>
        <div className={folder.Childs ? 'pointer' : ''} style={{float: 'left', width: this.props.deep * 15 + 'px'}} onClick={this.toggleChilds}>&nbsp;</div>
        <div className={folder.Childs ? 'pointer' : ''} style={{float: 'left', width: '10px'}} onClick={this.toggleChilds}>{folder.Childs ? this.state.showChilds ? '-' : '+' : <span>&nbsp;</span>}</div>
        <div className={activeFolder ? 'bg-success' : ''} style={{float: 'left', cursor: 'pointer'}} onClick={this.changeFolder}>{folder.Name.length > 20 ? folder.Name.substring(1, 20) + '...' : folder.Name}</div>
        <div className={folder.Childs ? 'pointer' : ''} style={{float: 'right'}} onClick={this.changeFolder}>{folder.Childs && folder.Childs.length}</div>
      </div>
      {this.state.showChilds && folder.Childs
        ? folder.Childs.map((Id, n) => {
          return <FolderItem
            key={n}
            folders={this.props.folders}
            Id={Id}
            currentFolder={this.props.currentFolder}
            deep={this.props.deep + 1}
            changeFolder={this.changeFolder}
          />
        })
        : null
      }
    </div>
  }
})

const Files = React.createClass({
  /**
   * Смена папки инициируемое из хлебных крошек
   * @param  {Uuid} Id Id папки, передающееся вышестоящему компоненту
   */
  changeFolder (Id) {
    this.props.changeFolder(Id, this.props.path)
  },
  render () {
    let total = 0
    let rows = <tbody>
      {this.props.files.length
        ? this.props.files.map((item, n) => {
          total += +item.Size
          return <tr key={n}>
            <td>{item.Name.length > 30 ? item.Name.substring(1, 30) + '...' : item.Name}</td>
            <td className='text-right'>{+item.Size ? prettyByte(item.Size) : '0'}</td>
            <td>{moment(item.Ctime).utcOffset(180).format('MM.DD.YYYY HH:MM')}</td>
          </tr>
        })
        : 'Нет файлов в папке'
      }
    </tbody>
    let currentFolderPath = this.props.path.map((item, n) => {
      let isActive = item.Id === this.props.currentFolder
      return <span key={n} onClick={() => !isActive && this.changeFolder(item.Id)} style={{cursor: 'pointer'}}>/
        <span className={isActive ? 'bg-success' : ''}>{item.Name}</span>
      </span>
    })
    return <div>
      <h3>Текущая папка</h3>
      <h4>{currentFolderPath}</h4>
      <table className='table table-hover table-condensed table-responsive'>
        <thead>
          <tr>
            <th>Наименование</th>
            <th className='col-sm-3'>Размер</th>
            <th className='col-sm-4'>Дата</th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td className='text-right'>Итого {this.props.files.length} файлов</td>
            <td className='text-right'>{total ? prettyByte(total) : '0'}</td>
            <td />
          </tr>
        </tfoot>
        {rows}
      </table>
    </div>
  }
})

/**
 * Компонент отображающий и изменяющий текущие разрешения папки
 */
const FolderPermissions = React.createClass({
  getInitialState () {
    return {
      permissionsList: [],
      folderPermissions: []
    }
  },
  /**
   * Получение обновлённых разрешений
   */
  componentWillReceiveProps (nextProps) {
    if (window.permissionsList && this.state.permissionsList.length === 0) {
      this.setState({
        permissionsList: window.permissionsList
      })
    }
    if (nextProps.Id) {
      axios({
        method: 'get',
        url: '/folderPermissions',
        params: {
          FolderId: nextProps.Id
        }
      })
      .then(res => {
        // console.log(res.data)
        this.setState({
          folderPermissions: res.data
        })
      })
      .catch(console.log)
    }
  },
  /**
   * Изменение конкретного разрешения
   */
  chagePermission (group, perm) {
    let name = group.Name
    let PermissionId = perm.Id
    let text = (PermissionId & group.Permission ? 'Удалить' : 'Установить') + ' разрешение \n' +
      'на ' + perm.Name + '\n' +
      'для ' + (name === name.toLowerCase() ? 'пользователя ' : 'группы ') + name + '\n' +
      'для папки ' + this.props.currentFolder.Name + '?'
    if (window.confirm(text)) {
      axios({
        method: 'post',
        url: '/togglePermission',
        params: {
          Id: this.props.Id,
          PermissionId: PermissionId,
          Name: name
        }
      })
      .then(res => {
        this.componentWillReceiveProps(this.props)
      })
      .catch(console.log)
    }
  },
  /**
   * Удаление всех разрешений юзера/группы на папке
   */
  deletePermission (group) {
    axios({
      method: 'post',
      url: '/deletePermission',
      params: {
        Id: this.props.Id,
        Name: group.Name
      }
    })
    .then(res => {
      this.componentWillReceiveProps(this.props)
    })
    .catch(console.log)
  },
  render () {
    // console.log(this.props)
    let folder = this.props.currentFolder
    return <div>
      <h3>Текущие разрешения</h3>
      <table className='table table-condensed table-bordered'>
        <thead>
          <tr>
            <th rowSpan='2' className='middle'>Группа</th>
            <th colSpan={this.state.permissionsList.length} className='middle'>Разрешения</th>
          </tr>
          <tr style={{'writingMode': 'sideways-lr'}}>
            {this.state.permissionsList.map((item, n) => {
              return <th key={n}>{item.Name}</th>
            })}
          </tr>
        </thead>
        {folder ? <tbody>
          <tr>
            <td title='В скобках информация, от кого получены'>Текущие ({folder.permName})</td>
            {this.state.permissionsList.map((item, n) => {
              return <td key={n} className='middle'>{item.Id & folder.Permission ? '+' : '-'}</td>
            })}
          </tr>
          {this.state.folderPermissions.map((group, n) => {
            return <tr key={n}>
              <td>{group.Name} {group.isOwn
                ? <span className='glyphicon glyphicon-remove pointer'
                  title='Удалить разрешения'
                  onClick={() => this.deletePermission(group)}></span>
                : ''}</td>
              {this.state.permissionsList.map((item, n) => {
                return <td key={n} className='middle pointer hover' onClick={() => this.chagePermission(group, item)}>{item.Id & group.Permission ? '+' : '-'}</td>
              })}
            </tr>
          })}
        </tbody> : null}
      </table>
    </div>
  }
})
