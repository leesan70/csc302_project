import React from "react";

import {
    Question
} from "Components/Form/Question";

import {
    RadioGroup,
    Checkbox,
    FormControl,
    FormLabel,
    FormControlLabel,
    Typography,
    List,
    Collapse,
    TextField
} from '@material-ui/core';

var timeout

export class ChecklistInput extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            selectedChoices: []
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.response !== undefined && nextProps.response.answers !== undefined &&
            this.state.selectedChoices.length === 0){
            let answer = nextProps.response.answers.filter(answer => answer.nodeID === this.props.node.referenceID)[0];
            if (answer !== undefined){
                let choices = answer.choices;
                this.setState({
                    selectedChoices: choices
                });
            }
        }
    }

    onChange(e) {
        let index = e.target.getAttribute("index")
        let newSelection = this.props.node.choices[index];
        
        if(e.target.getAttribute("type") == "text") {
            let answerType = "stringValue";
            let answerVal = e.target.value
            let field = this.props.node.choices[index].field
            if (field.valueType === "decimal"){
                answerType = "numberValue";
            } 

            if(timeout)
                clearTimeout(timeout)
            timeout = setTimeout(() => {
                var choice = {
                    choiceID:newSelection.referenceID,
                    field: {}
                }
                choice.field[answerType] = answerVal
                this.props.addAnswer(this.props.response, this.props.node.referenceID, null, null, [choice])
            }, 1000);
        } else {

            let selections = this.state.selectedChoices;
            if (e.target.checked){
                if (newSelection.selectionDeselectsSiblings) {
                    selections = [];
                } else {
                    selections = selections.filter(choice => choice.selectionDeselectsSiblings != true)
                }

                selections.push({
                    choiceID: newSelection.referenceID,
                    selectionDeselectsSiblings: newSelection.selectionDeselectsSiblings
                });
            } else {
                selections = selections.filter(choice => choice.choiceID !== newSelection.referenceID);
            }
            this.props.addAnswer(this.props.response, this.props.node.referenceID, undefined, undefined, selections);
            e.stopPropagation();
            this.setState({
                selectedChoices: selections
            });
        }
    }

    getSubQuestions(choiceID) {
        if (this.props.node.dependencies) {
            return this.props.node.dependencies
                .filter(dep => choiceID.startsWith(dep.choiceID))
                .map(dep => this.props.getChildrenFn(dep.nodeID))
                .map(child => {
                    return (
                        <Question
                            key={child.referenceID}
                            node={child}
                            addAnswer={this.props.addAnswer}
                            getChildrenFn={this.props.getChildrenFn}
                            response={this.props.response}
                        />
                    );
                })
        }

        return [];
    }

    render() {
        let selectedChoices = this.state.selectedChoices;
        return (
            <FormControl onChange={this.onChange.bind(this)}>
                <FormLabel />
                <RadioGroup>
                    {this.props.node.choices.map((choice, index) => {

                        let checked = selectedChoices.filter(c => c.choiceID === choice.referenceID).length > 0;

                        const subQuestions = this.getSubQuestions(choice.referenceID);
                        let subQuestionsList = null;
                        if (subQuestions.length > 0) {
                            subQuestionsList = (
                                <Collapse in={checked}>
                                    <List>{subQuestions}</List>
                                </Collapse>
                            );
                        }

                        let field = null;
                        if (choice.hasOwnProperty('field')) {
                            field = (
                                <Collapse in={checked}>
                                    <TextField
                                        color="primary"
                                        fullWidth={true}
                                        inputProps={{
                                            index:index
                                        }}
                                    />
                                </Collapse>
                            );
                        }

                        return (
                            <React.Fragment>
                                <FormControlLabel 
                                    value={choice.title}
                                    label={<Typography variant="h5">{choice.title}</Typography>}
                                    control={
                                        <Checkbox
                                            key={choice.referenceID}
                                            id={choice.referenceID}
                                            inputProps={{
                                                index: index
                                            }}
                                            checked={checked}
                                            type="checkbox"
                                            color="primary"
                                            name={this.props.node.referenceID}
                                            value={choice.title}
                                        />
                                    }
                                    key={choice.referenceID}                                
                                />
                                {field}
                                {subQuestionsList}
                            </React.Fragment>
                        );
                    })}
                </RadioGroup>
            </FormControl>
        );
    }
}