import React, { Component } from 'react';
import { fetchGet } from './fetch'
import '../css/App.css';
import SDCMiddleware from './SDCMiddleware'

class Title extends Component {
	constructor(props) {
	    super(props);
	}	

	render() {
		return (<h1> {this.props.title} </h1>);
	}
}

class Section extends Component {
	constructor(props) {
	    super(props);
	}	

	render() {
		return (<h2> {this.props.title} </h2>);
	}
}

class Question extends Component {
	constructor(props) {
	    super(props);
	}	

	render() {
		const style = {
			paddingLeft: this.props.depth*25 + 'px'
		}	
		return (<div style={style}> {this.props.title} </div>);
	}
}

class App extends Component {
	state = {
		forms: [],
		json: "",
		xml: "",
		iterator:null
	};

	componentDidMount(prevProps) {
		SDCMiddleware.getFormsList()
		.then(data => {
			this.setState({forms:data.forms})
		})
	}

	selectForm(e) {
		SDCMiddleware.getForm(e.target.value)
		.then(data => {
			this.setState({json:data.json, xml:data.xml})
		})

		SDCMiddleware.getFormIterator(e.target.value)
		.then(iterator => {
			this.setState({iterator:iterator})
		})
	}

	render(){
		var formElements = this.state.forms.map((x, i) => {
			var nameSplit = x.split('.')
			nameSplit.pop()
			var formName = nameSplit.join('.')
			return <option value={formName} key={i}>{formName}</option>
		})
		var xmlString = this.state.xml.replace("\\n", "\n");

		var reactForm = []
		var builtForm = ""
		if(this.state.iterator) {

			if(this.state.iterator.title != null) {
				reactForm.push(<Title key="title" title={this.state.iterator.title()}/>)
			}

			var index = 0;
			while(this.state.iterator.hasNext()) {
				var it = this.state.iterator.next()
				if(it.section != null) {
					var S_key = "S_" + index
					reactForm.push(<Section key={S_key} title={it.section}/>)
					builtForm += '{"SECTIONSECTIONSECTION:"' + it.section + '},\n'
				}

				builtForm += JSON.stringify(it.node, null, 2) + ',\n'
				var Q_key = "Q_" + index
				reactForm.push(<Question key={Q_key} title={it.node.title} depth={it.node.depth}/>)
				index++
			}
		}

		return (
		<div className="App">
			<header className="App-header">
			<p>
				CSC302
			</p>
			<select defaultValue="default" onChange={this.selectForm.bind(this)}>
			<option value="default" hidden disabled>Select a form</option>
			{formElements}
			</select>
			</header>
			<div class="previewWindow">
				{/*<div>
					<pre>{xmlString}</pre>
				</div>*/}
				<div>
					<pre>{JSON.stringify(this.state.json, null, 2)}</pre>
				</div>
				{/*<div>
					<pre>{builtForm}</pre>
				</div>*/}
				<div class="form">
					{reactForm}
				</div>
			</div>
		</div>
		);
	}
}

export default App;
