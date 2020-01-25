import React from "react";
import {
    Typography,
    Card,
    CardContent,
    Collapse
} from '@material-ui/core';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

export class Result extends React.Component {
    constructor(props) {
        super(props);
        this.state = {resultExpanded: "summary"}
    }

    render() {
        const onClick = (which) => {this.setState({resultExpanded: which});}

        // Create summary
        var summary = null
        var result = null
        var query = null
        if(this.props.answer) {
            // Aggregations
            var agg = null
            if(this.props.answer.aggs != null) {
                var aggs = []
                for(var key in this.props.answer.aggs) {
                    if(key == "Count") {
                        var value = ""
                        var agg = this.props.answer.aggs[key]
                        for(let i = 0; i < agg.buckets.length; i++)  {
                            value += `\n${agg.buckets[i].key}: ${agg.buckets[i].doc_count}`
                        }
                        aggs.push({name:key, value:value})
                    } else {
                        console.log(this.props.answer.aggs)
                        var value = this.props.answer.aggs[key].value
                        value = Math.ceil(value*100)/100
                        aggs.push({name:key, value:value})
                    }
                }
                agg = aggs.map(x => {
                    return (`\nAggregation (${x.name}):${x.value}\n\n`)
                })
            }

            // Hits
            var titles = null
            var results = null
            if(this.props.answer.hits != null && this.props.answer.hits.length > 0) {
                titles = `Number of hits: ${this.props.answer.hits.length}\nPatientID\tValue`
                results = this.props.answer.hits.map(x => {
                    var fields = []
                    fields.push(x.patientID)
                    //fields.push(x.formFillerID)
                    fields.push(x.choiceTitle)
                    fields.push(x.numberValue)
                    fields.push(x.stringValue)
                    return (`\n${fields.filter(x=>{return x!=null}).join('\t\t')}`)
                })
                results = results + `\n\nPatientID,FormFillerID,choice,numberValue,stringValue`
                results = results + this.props.answer.hits.map(x => {
                    var fields = []
                    fields.push(x.patientID)
                    fields.push(x.formFillerID)
                    fields.push(x.choiceTitle || ',')
                    fields.push(x.numberValue || ',')
                    fields.push(x.stringValue || ',')
                    return (`\n${fields.join(',')}`)
                })
            }
            summary = (
                <Typography style={{'fontFamily': 'Courier', 'fontSize': 10, 'overflowWrap': 'break-word', 'whiteSpace':'pre-wrap'}}>
                    {agg}{titles}{results}
                </Typography>)

            result = (
               <div> <pre style={{'font-family': 'Courier', 'font-size': 10, 'overflow-wrap': 'break-word'}}>
                {JSON.stringify(this.props.answer, null, 2) }</pre></div>)

            query = (
               <div> <pre style={{'font-family': 'Courier', 'font-size': 10, 'overflow-wrap': 'break-word'}}>
                {JSON.stringify(this.props.query, null, 2) }</pre></div>)
        } else {
            summary = "Run query to get result"
            result = "Run query to get result"
            query = "Run query to get result"
        }

        return (
            <Card style={{marginTop: 10}}>
                <CardContent>
                    <Typography variant="h4" onClick={()=>{onClick("summary")}}>Result Summary<ArrowDropDownIcon/></Typography>
                    <Collapse in={this.state.resultExpanded == "summary"} timeout="auto" unmountOnExit>
                        {summary}
                    </Collapse>
                </CardContent>
                <CardContent>
                    <Typography variant="h4" onClick={()=>{onClick("data")}}>JSON Data<ArrowDropDownIcon/></Typography>
                    <Collapse in={this.state.resultExpanded == "data"} timeout="auto" unmountOnExit>
                        {result}
                    </Collapse>
                </CardContent>
                <CardContent>
                    <Typography variant="h4" onClick={()=>{onClick("query")}}>Elasticsearch Query<ArrowDropDownIcon/></Typography>
                    <Collapse in={this.state.resultExpanded == "query"} timeout="auto" unmountOnExit>
                        {query}
                    </Collapse>
                </CardContent>
            </Card>
        )
    }
}