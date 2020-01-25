import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { SDCMiddleware } from 'Actions';
import { UserActions } from 'Actions';

import './test.css';

class Title extends React.Component {
	constructor(props) {
	    super(props);
	}	

	render() {
		return (
			<h1> {this.props.title} </h1>
		);
	};
}

class Section extends React.Component {
	constructor(props) {
	    super(props);
	}	

	render() {
		return (<h2> {this.props.title} </h2>);
	}
}

class Question extends React.Component {
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

class TestPage extends React.Component {

    constructor(props) {
        super(props);

        this. state = {
			forms: [],
			form: "",
			json: "",
			xml: "",
			iterator:null
		};
    }

	componentDidMount(prevProps) {
		SDCMiddleware.getFormsList()
		.then(data => {
			this.setState({forms:data})
		})
	}

	selectForm(e) {
		console.log("Select form?")
		// Clear state
		this.setState({model:"", json:"", xml:"", iterator:null})

		// This is temporary, to ensure the forms update with the changes we are going to "Submit" an updated form every time we get a form
		var title = e.target.value
		console.log("ADDING NEW FORM!")
		SDCMiddleware.getFormIterator(title, true)
		.then(data => {
			// TODO: this extra data is just tagging along for debuging purposes, can be removed later
			console.log("ITERATOR RESULT")
			console.log(data)
			this.setState({iterator:data.iterator, form:data.form, json:data.json, xml:data.xml})
		})
	}

	render(){
		// Dropdown options 
		var formOptions = this.state.forms.map((x, i) => {
			var nameSplit = x.title.split('.')
			nameSplit.pop()
			var formName = nameSplit.join('.')
			return <option value={formName} key={i}>{formName}</option>
		})

		// The form parsed in various ways
		var xmlString = ""
		if(this.state.xml)
			xmlString = this.state.xml.replace("\\n", "\n");

		var reactForm = []
		if(this.state.iterator) {
			if(this.state.iterator.title != null) {
				reactForm.push(<Title key="title" title={this.state.iterator.title}/>)
			}

			var index = 0;
			while(this.state.iterator.hasNext()) {
				var it = this.state.iterator.next()
				if(it.section != null) {
					var S_key = "S_" + index
					reactForm.push(<Section key={S_key} title={it.section}/>)
				}

				var Q_key = "Q_" + index
				reactForm.push(<Question key={Q_key} title={it.node.title} depth={it.node.depth}/>)
				index++
			}
		}

		return (
		<div class="formViewer">
			<header className="testHeader">
			<p>
				SDC Form Preview
			</p>
			<select defaultValue="default" onChange={this.selectForm.bind(this)}>
			<option value="default" hidden disabled>Select a form</option>
				{formOptions}
			</select>
			</header>
			<div class="previewWindow">
				{/*<div>
					<pre>{xmlString}</pre>
				</div>*/}
				<div>
					<pre>{JSON.stringify(this.state.json, null, 2)}</pre>
				</div>
				<div>
					<pre>{JSON.stringify(this.state.form, null, 2)}</pre>
				</div>
				<div class="form">
					{reactForm}
				</div>
			</div>
		</div>
		);
	}
}

function mapState(state) {
    const { registering } = state.registration;
    return { registering };
}

const actionCreators = {
    register: UserActions.register
}

const connectedTestPage = connect(mapState, actionCreators)(TestPage);
export { connectedTestPage as TestPage };
