import React from "react";

import {
    RadioInput
} from "Components/Form/RadioInput";
import {
    ChecklistInput
} from "Components/Form/ChecklistInput";
import {
    TextInput
} from "Components/Form/TextInput";
import {
    Collapse,
    Typography,
    Grid,
    List,
    Card,
    CardContent,
    Divider
} from "@material-ui/core";

export class Question extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            expanded: true
        };
    }

    onTitleClick() {
        this.setState({
            expanded: !this.state.expanded
        });
    }

    render(){
        let input;
        if (this.props.node.hasOwnProperty("choices")) {
            if (this.props.node.maxSelections === 1) {
                input = <RadioInput node={this.props.node} addAnswer={this.props.addAnswer} response={this.props.response} getChildrenFn={this.props.getChildrenFn}/>
            } else {
                input = <ChecklistInput node={this.props.node} addAnswer={this.props.addAnswer} response={this.props.response} getChildrenFn={this.props.getChildrenFn}/>
            }
        } else {
            input = <TextInput node={this.props.node} addAnswer={this.props.addAnswer} response={this.props.response}/>
        }

        return (
            <Card className="question">
                <CardContent>
                <Typography variant="h4" onClick={this.onTitleClick.bind(this)}><i>{this.props.node.title}</i></Typography>
                <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
                    {input}
                </Collapse>
                </CardContent>
            </Card>
        );
    }
}

