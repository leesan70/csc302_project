import React from "react";
import {
    List,
    Card,
    CardContent,
    Collapse,
    Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
    Question
} from 'Components/Form/Question';

const SectionStyle = makeStyles(theme => ({
    card: {
        flex: 1.0,
        flexDirection: 'row',
        justify: 'center',
        alignContent: 'center',
        alignItems: 'center'
    }
}));

export class Section extends React.Component {

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

    render() {
        const rootQuestions = this.props.roots.map(root => {
            return (
                <Question
                    key={root.referenceID}
                    node={root}
                    addAnswer={this.props.addAnswer}
                    getChildrenFn={this.props.getChildrenFn}
                    response={this.props.response}
                />
            );
        });

        let title = this.props.section >= 0 ? this.props.section + " - " + this.props.sectionTitle : "Comments";

        return (
            <Card style={{}}>
                <CardContent>
                    <Typography variant="h3" onClick={this.onTitleClick.bind(this)}>
                        {title}
                    </Typography>
                    <Collapse className="sectionContent" in={this.state.expanded} timeout="auto" unmountOnExit>
                        <List>{rootQuestions}</List>
                    </Collapse>
                </CardContent>
            </Card>
        );
    }
}