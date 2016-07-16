import React from 'react'
import axios from 'axios'

export const Folder = React.createClass({
  getInitialState () {
    window.showingFolders = {}
    return {
      folders: {
        root: []
      }
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
          />
        })}
      </div>
      <div className=''>
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
  render () {
    let folder = this.props.folders[this.props.Id]
    let pointerStyle = {}
    if (folder.Childs) pointerStyle.cursor = 'pointer'
    return <div>
      <div style={pointerStyle} onClick={this.toggleChilds} className='row'>
        <div className='' style={{float: 'left', width: this.props.deep * 15 + 'px'}}>&nbsp;</div>
        <div className='' style={{float: 'left', width: '10px'}}>{folder.Childs ? this.state.showChilds ? '-' : '+' : <span>&nbsp;</span>}</div>
        <div className='' style={{float: 'left'}}>{folder.Name.length > 20 ? folder.Name.substring(1, 20) + '...' : folder.Name}</div>
        <div className='' style={{float: 'right'}}>{folder.Childs && folder.Childs.length}</div>
      </div>
      {this.state.showChilds && folder.Childs
        ? folder.Childs.map((Id, n) => {
          return <FolderItem
            key={n}
            folders={this.props.folders}
            Id={Id}
            deep={this.props.deep + 1}
          />
        })
        : null
      }
    </div>
  }
})
