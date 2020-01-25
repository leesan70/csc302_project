import React from "react";

import {
    TextField,
    FormControl,
    FormLabel,
    FormControlLabel
} from '@material-ui/core';
import {FormActions} from "Actions";

export class TextInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errorText: '',
            value: ''
        };

        this.uploadLatency = undefined;
    }

    componentWillReceiveProps(nextProps, nextContext) {
        // if (nextProps.node !== undefined && nextProps.node.title === "Clinical History (specify)") {
        //     debugger;
        // }
        if (nextProps.response !== undefined && nextProps.response.answers !== undefined && this.state.value === ""){
            let answer = nextProps.response.answers.filter(answer => answer.nodeID === this.props.node.referenceID)[0];
            let value = "";
            if (answer !== undefined) {
                let key = "stringValue";
                if (this.props.node.field.valueType === "decimal") {
                    key = "numberValue";
                }
                value = answer.field[key];
            }
            this.setState({
                value: value
            });
        }
    }

    onChange(e) {
        let error = false;
        let value = e.target.value;
        if (this.props.node.field && this.props.node.field.valueType && this.props.node.field.valueType === "decimal") {
            let pattern = /^\d+.?\d*$/g;
            if (e.target.value.length > 0 && !e.target.value.match(pattern)) {
                error = true;
            } else {
                error = false;
            }
        }
        this.setState({
            error: error,
            value: value
        });
        if (error){
            return;
        }

        if (this.uploadLatency !== undefined){
            clearTimeout(this.uploadLatency);
        }
        this.uploadLatency = setTimeout(function() {
            this.uploadLatency = undefined;
            if (value === this.state.value){
                let answerType = "stringValue";
                if (this.props.node.field.valueType === "decimal"){
                    answerType = "numberValue";
                }
                this.props.addAnswer(this.props.response, this.props.node.referenceID,
                    answerType, value, null);
            }
        }.bind(this), 500);
    }

    render() {
        let textAfter = null;
        if (this.props.node && this.props.node.field && this.props.node.field.hasOwnProperty("textAfter")) {
            textAfter = <i>&nbsp;{this.props.node.field.textAfter}</i>
        }

        return (
            <FormControl className="fieldInput">
                <FormLabel />
                <FormControlLabel 
                    // value={choice.title}
                    // label={choice.title}
                    control={
                        <TextField 
                            name={this.props.node.referenceID}
                            error={this.state.error}
                            value={this.state.value}
                            inputProps={{
                                style: {fontSize: 15}
                            }}
                            onChange={this.onChange.bind(this)}
                            color="primary"
                            fullWidth={true}
                        />
                    }
                    key={this.props.node.referenceID}                                
                />
                {textAfter}                    
            </FormControl>
        )
    }
}