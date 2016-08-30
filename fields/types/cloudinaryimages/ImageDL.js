import React, { PropTypes } from 'react';
var classNames=require('classnames');

export default class ImageDL extends React.Component{

constructor(props) {
    super(props);
    this.state = {
			isActive: false
    };
  }	
	/*static defaultProps= {
		isActive :false
	},
	handleCheck = (e) => {
				this.setState({isActive:!this.state.isActive})
	},*/
  handleCheck = (e) => {
			//console.log('foo');
			this.setState({isActive:!this.state.isActive})
	};
	render () { 
    const dlCheckStyle = {
      verticalAlign:'top',
      marginRight:'4px',
      height: '10px',
      display: 'inline'
    };
    
    const dlLinkStyle = {
      display: 'none'
    };

    const dlDivStyle= {
      display:'inline'
    };    

	let dlClasses=classNames('dlLink', {'isActive':this.state.isActive});
		return (
			<div style={dlDivStyle}>
			<input type="checkBox" style={dlCheckStyle} onChange={this.handleCheck} />
			<a className={dlClasses} style={dlLinkStyle} href={this.props.imageUri} download></a>
			</div>
		);
	}	
}
