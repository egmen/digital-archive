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
    this.getTree()
  },
  getTree () {
    axios({
      method: 'get',
      url: '/tree',
      params: {
      }
    })
    .then(res => {
      this.setState({
        folders: res.data
      })
    })
    .catch(console.log)
  },
  changeFolder (Id, path) {
    this.setState({
      currentFolder: Id,
      currentFolderPath: path
    })
    axios({
      method: 'get',
      url: '/files',
      params: {
        FolderId: Id
      }
    })
    .then(res => {
      this.setState({
        files: res.data
      })
    })
    .catch(console.log)
  },
  render () {
    return <div className='row'>
      <div className='col-md-2 col-sm-4'>
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
      <div className='col-md-8 col-sm-8'>
        <br /><br /><br />
        <Files
          path={this.state.currentFolderPath}
          files={this.state.files}
        />
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
        <div className='' style={{float: 'left', width: this.props.deep * 15 + 'px', cursor: folder.Childs ? 'pointer' : null}} onClick={this.toggleChilds}>&nbsp;</div>
        <div className='' style={{float: 'left', width: '10px', cursor: folder.Childs ? 'pointer' : null}} onClick={this.toggleChilds}>{folder.Childs ? this.state.showChilds ? '-' : '+' : <span>&nbsp;</span>}</div>
        <div className={activeFolder ? 'bg-success' : ''} style={{float: 'left', cursor: 'pointer'}} onClick={this.changeFolder}>{folder.Name.length > 20 ? folder.Name.substring(1, 20) + '...' : folder.Name}</div>
        <div className='' style={{float: 'right', cursor: 'pointer'}} onClick={this.changeFolder}>{folder.Childs && folder.Childs.length}</div>
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
    let currentFolderPath = this.props.path.map(item => {
      return '/' + item.Name
    })
    // console.log(this.props.path)
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
