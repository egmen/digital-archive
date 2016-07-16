import React from 'react'
import axios from 'axios'

export const Folder = React.createClass({
  getInitialState () {
    window.showingFolders = {}
    return {
      folders: {
        root: []
      },
      currentFolder: '',
      currentFolderPath: ''
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
      // console.log(res.data.root)
    })
    .catch(console.log)
  },
  changeFolder (Id, Path) {
    this.setState({
      currentFolder: Id,
      currentFolderPath: Path
    })
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
            deep={0}
            changeFolder={this.changeFolder}
          />
        })}
      </div>
      <div className='col-md-8 col-sm-6'>
        <br /><br /><br />
        <h3>Текущая папка</h3>
        <h2>{this.state.currentFolderPath}</h2>
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
  changeFolder (Id, Path) {
    let Name = this.props.folders[this.props.Id].Name
    // Если задана вторая переменная значит это всплывающее событие
    if (Path) {
      this.props.changeFolder(Id, Name + '/' + Path)
    } else {
      this.props.changeFolder(this.props.Id, Name)
    }
  },
  render () {
    let folder = this.props.folders[this.props.Id]
    return <div>
      <div onDoubleClick={this.toggleChilds} className='row'>
        <div className='' style={{float: 'left', width: this.props.deep * 15 + 'px', cursor: folder.Childs ? 'pointer' : null}} onClick={this.toggleChilds}>&nbsp;</div>
        <div className='' style={{float: 'left', width: '10px', cursor: folder.Childs ? 'pointer' : null}} onClick={this.toggleChilds}>{folder.Childs ? this.state.showChilds ? '-' : '+' : <span>&nbsp;</span>}</div>
        <div className='' style={{float: 'left', cursor: 'pointer'}} onClick={this.changeFolder}>{folder.Name.length > 20 ? folder.Name.substring(1, 20) + '...' : folder.Name}</div>
        <div className='' style={{float: 'right', cursor: 'pointer'}} onClick={this.changeFolder}>{folder.Childs && folder.Childs.length}</div>
      </div>
      {this.state.showChilds && folder.Childs
        ? folder.Childs.map((Id, n) => {
          return <FolderItem
            key={n}
            folders={this.props.folders}
            Id={Id}
            deep={this.props.deep + 1}
            changeFolder={this.changeFolder}
          />
        })
        : null
      }
    </div>
  }
})
