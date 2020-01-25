import React from 'react';
import { FormActions, UserActions } from 'Actions'
import { connect } from 'react-redux';
import { 
    Result,
    ESQueryDialog
 } from 'Components/Query';

import MenuIcon from '@material-ui/icons/Menu'; 

import {
     Select,
     Toolbar,
     IconButton,
     List,
     Link,
     AppBar,
     MenuItem,
     RadioGroup,
     Radio,
     FormControlLabel,
     TextField,
     Collapse,
     Button,
     Grid,
     Box,
     Switch,
     Fade
} from '@material-ui/core';

var screenChangeThreshold = 800;

class FormQueryPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            formID: "",
            nodeID: "",
            questionID: "",
            choiceID: "",
            nodeMap: null,
            operator: null,
            quantifier: null,
            sortOrder: "DESC",
            singlePatient: false,
            patientID: null,
            limitResults: false,
            limit:null,
            dialogOpen: false,
            smallScreen: window.innerWidth <= screenChangeThreshold,
            menuIsOpen:false
        }
        this.listOperators = ["LESS_THAN", "GREATER_THAN", "EQUAL"];
        this.aggOperators = ["MIN", "MAX", "AVG"];
        this.menuToggle = this.menuToggle.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
    }
   
    menuToggle() {
        this.setState({ menuIsOpen: !this.state.menuIsOpen })
    } 

    handleLogout() {
        this.props.logout();
        return this.props.history.push(`/login`)
    }

    async componentDidMount() {
        await this.props.getFormList();
        window.addEventListener("resize", this.resize.bind(this));
    }

    getFormList() {        
        if (this.props.form && !this.props.form.loading && this.props.form && this.props.form.forms){
            return this.props.form.forms.map(form => <MenuItem key={form.diagnosticProcedureID} value={form.diagnosticProcedureID}>{form.title}</MenuItem>)
        } else {
            return <h5>Forms could not be loaded at this time.</h5>
        }
    }

    getNodeList() {        
        if (this.props.form && !this.props.form.loading && this.props.form && this.props.form.loadedForm){
            return this.props.form.loadedForm.nodes
                        .map(node => <MenuItem key={node.referenceID} value={node.referenceID}>{`${node.title} - ${node.referenceID}`}</MenuItem>);
        } else {
            return <h5>Forms could not be loaded at this time.</h5>
        }
    }

    getNodeMap() {
        if (this.props.form && !this.props.form.loading && this.props.form && this.props.form.loadedForm){
            this.setState({
                nodeMap: new Map(
                    this.props.form.loadedForm.nodes.map(node => [node.referenceID, node])
                )
            });
            console.log(this.state.nodeMap);
        }
    }

    getChoiceList() {
        if (this.props.form && !this.props.form.loading && this.props.form && this.props.form.loadedForm && this.state.nodeID){
            return this.state.nodeMap.get(this.state.nodeID).choices
                        .map(node => <MenuItem key={node.referenceID} value={node.referenceID}>{`${node.title} - ${node.referenceID}`}</MenuItem>);
        } else {
            return <h5>Forms could not be loaded at this time.</h5>
        }
    }

    getSelectedChoice() {
        return this.state.nodeMap.get(this.state.nodeID).choices.find(choice => choice.referenceID === this.state.choiceID);
    }

    hasChoices() {
        return this.state.nodeID && this.state.nodeMap && this.state.nodeMap.get(this.state.nodeID).choices;
    }

    isFieldQuery() {
        return this.state.nodeID && (
                this.state.nodeMap.get(this.state.nodeID).hasOwnProperty('field')
                || this.hasChoices() && this.state.choiceID && this.getSelectedChoice().hasOwnProperty('field')
                );
    }

    getField() {
        if (this.isFieldQuery()) {
            if (this.state.nodeMap.get(this.state.nodeID).hasOwnProperty('field')) {
                return this.state.nodeMap.get(this.state.nodeID).field;
            } else {
                return this.getSelectedChoice().field;
            }
        }
    }

    resize() {
        this.setState({smallScreen: window.innerWidth <= screenChangeThreshold});
    }

    async sendQuery() {
        // TODO: validation goes here

        const query = {
            formID: this.state.formID,
            nodeID: this.state.nodeID,
            choiceID: this.state.choiceID,
            limit: this.state.limit,
            patientID: this.state.singlePatient ? this.state.patientID : null
        }

        if (this.isFieldQuery() && this.state.operator) {
            query.operator = this.state.operator;
            var queryType = this.listOperators.includes(this.state.operator) ? "LIST" : "AGGREGATE";
            if (this.state.operator && queryType === "LIST") {
                if (this.getField().valueType === "string") {
                    query.stringValue = this.state.quantifier;
                } else {
                    query.numberValue = this.state.quantifier;
                }
                query.sortOrder = this.state.sortOrder;
            }
        } else {
            if(!this.state.choiceID)
                query.operator = "COUNT"
        }

        console.log(query);
        await this.props.getFormQuery(query);
    }

    render() {

        const changeForm = async (event) => { 
            await this.setState({formID: event.target.value});
            await this.setState({nodeID: "", choiceID: ""});
            await this.props.getForm(this.state.formID);
            this.getNodeMap();
        }
        const changeNode = (event) => {
            this.setState({nodeID: event.target.value});
            this.setState({choiceID: ""});
        }
        const changeChoice = async (event) => await this.setState({choiceID: event.target.value});
        const changeOperator = async (event) => await this.setState({operator: event.target.value});
        const changeSortOrder = async (event) => await this.setState({sortOrder: event.target.value});
        const changeQuantifier = async (event) => await this.setState({quantifier: event.target.value});
        const changePatientID = async (event) => await this.setState({patientID: event.target.value});
        const changeSinglePatient = async (event) => {
            if(this.state.singlePatient)
                await this.setState({singlePatient: false, patientID:null});
            else
                await this.setState({singlePatient: true});
        }
        const changeLimit = async (event) => await this.setState({limit: event.target.value});
        const changeLimitResults = async (event) => {
            if(this.state.limitResults)
                await this.setState({limitResults: false, limit:null});
            else
                await this.setState({limitResults: true});
        }
        const openDialog = async (event) => await this.setState({dialogOpen: true});
        const closeDialog = async (event) => await this.setState({dialogOpen: false});

        const deselectOperator = async (event) => await this.setState({operator: null});

        const allOperators = this.listOperators.map(op => { return {op: op, type: "LIST"}; })
                             .concat(this.aggOperators.map(op => { return {op: op, type: "AGGREGATE"}}));
        let selectedOperator = this.state.operator;
        let sortOrder = this.state.sortOrder;

        const hasChoices = this.hasChoices();
        const isFieldQuery = this.isFieldQuery();

        let textAfter = null;
        if (isFieldQuery) {
            textAfter = this.getField().textAfter ? <i>&nbsp;{this.getField().textAfter}</i> : null;
        }

        const columnWidth = this.state.smallScreen ? 12 : 4;

        return (
            <Grid className="queryWrapper" container spacing={3}>
                <AppBar position="static" className="appBar">
                    <Toolbar>
                        <h3 className="noselect">Query Runner</h3>
                        <div className="menuButton">
                            <IconButton edge="start" color="inherit" aria-label="menu" 
                                onClick={this.menuToggle}>
                                <MenuIcon/>
                            </IconButton>
                        </div>
                    </Toolbar>
                </AppBar>
                <Collapse in={this.state.menuIsOpen} className="appBar menuDropdown">
                    <List>
                        <Button href='/upload'> Form Manager View </Button>
                        <br/>
                        <Button href='/formSelector'> Form Selection </Button>
                        <br/>
                        <Button href='/docs'> Documentation </Button>
                        <br/>
                        <Button onClick={this.handleLogout}>Logout</Button>
                        <br/>
                    </List>
                </Collapse>

                <Grid className="content">
                    <Grid item xs={columnWidth}>
                            <h3>Select a form: </h3>
                            <Select
                                autoWidth={true}
                                id="form-select"
                                value={this.state.formID}
                                onChange={changeForm}
                            >
                                {this.props.form && this.getFormList()}
                            </Select>
                    </Grid>
                    <Grid item xs={columnWidth}>
                        <Fade in={this.props.form.loadedForm}>
                            <div>
                                <h3>Select a question: </h3>
                                <Select
                                    autoWidth={true}
                                    id="node-select"
                                    value={this.state.nodeID}
                                    onChange={changeNode}
                                >
                                    {this.props.form.loadedForm && this.getNodeList()}
                                </Select>
                            </div>
                        </Fade>
                    </Grid>
                    <Grid item xs={columnWidth}>
                        <Collapse in={this.state.nodeID && hasChoices}>
                            <div>
                                <h3>Select a choice: </h3>
                                <Select
                                    autoWidth={true}
                                    id="node-select"
                                    value={this.state.choiceID}
                                    onChange={changeChoice}
                                >
                                    {this.props.form.loadedForm && this.state.nodeID && hasChoices && this.getChoiceList()}
                                </Select>
                            </div>
                        </Collapse>
                    </Grid>
                    <Collapse className="operators" in={isFieldQuery}>
                        <Grid container>
                        <Grid item xs={4}>
                            <h3>Select an operator:</h3>
                            <RadioGroup>
                                {allOperators.map(op => {
                                    return (
                                        <FormControlLabel 
                                            key={op.op}
                                            control={<Radio checked={selectedOperator === op.op} onChange={changeOperator} color="primary"/>}
                                            value={op.op}
                                            label={op.op}
                                        />
                                    );
                                })}
                            </RadioGroup>
                            <Button onClick={deselectOperator} variant="contained" color="primary" type="button">Clear</Button>
                        </Grid>
                        <Grid item xs={8}>
                            <Fade in={this.listOperators.includes(this.state.operator)} timeout={1000}>
                                <div>
                                    <h3>Choose a quantifier for the selected LIST operator:</h3>
                                    <TextField onChange={changeQuantifier}/>
                                    {textAfter}
                                    <h3>Choose the sort order of the results:</h3>
                                    <RadioGroup>
                                        <FormControlLabel
                                            key={1}
                                            control={<Radio checked={sortOrder === "ASC"} onChange={changeSortOrder} color="primary"/>}
                                            value="ASC"
                                            label="Ascending"
                                        />
                                        <FormControlLabel
                                            key={2}
                                            control={<Radio checked={sortOrder === "DESC"} onChange={changeSortOrder} color="primary"/>}
                                            value="DESC"
                                            label="Descending"
                                        />
                                    </RadioGroup>
                                </div>
                            </Fade>
                        </Grid>
                        </Grid>
                    </Collapse>
                    <Grid item xs={12} class="switchBox">
                        <Box display="flex" flexDirection="row" align-items="top">
                            <h3>Restrict results to single patient?</h3>
                            <Switch
                                checked={this.state.singlePatient}
                                onChange={changeSinglePatient}
                                value="checkedB"
                                color="primary"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                            <Fade direction='left' in={this.state.singlePatient}>
                                <TextField onChange={changePatientID} value={this.state.patientID || ''} placeholder="Patient ID"/>
                            </Fade>
                        </Box>
                    </Grid>

                    <Grid item xs={12} class="switchBox">
                        <Box display="flex" flexDirection="row" align-items="top">
                            <h3>Limit number of results?</h3>
                            <Switch
                                checked={this.state.limitResults}
                                onChange={changeLimitResults}
                                value="checkedC"
                                color="primary"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                            <Fade direction='left' in={this.state.limitResults}>
                                <TextField onChange={changeLimit} value={this.state.limit || ''} placeholder="Result Limit"/>
                            </Fade>
                        </Box>
                    </Grid> 
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" type="button" style={{width: '100%', padding:5}} onClick={this.sendQuery.bind(this)}>Run Query</Button>
                        <Button variant="contained" color="default" type="button" style={{width: '100%', padding:5}} onClick={openDialog.bind(this)}>Run Elasticsearch Query</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Result 
                            answer={this.props.form && this.props.form.formQuery && this.props.form.formQuery.answer} 
                            query={this.props.form && this.props.form.formQuery && this.props.form.formQuery.query} 
                        />
                    </Grid>
                    <ESQueryDialog 
                        open={this.state.dialogOpen} 
                        onClick={closeDialog.bind(this)} 
                        sendESQuery={this.props.getFormESQuery} 
                        query={this.props.form && this.props.form.formQuery && this.props.form.formQuery.query} 
                    />
                </Grid>
            </Grid>
        );
    }
}

// TODO: Change
function mapState(state) {
    const { form, authentication } = state;
    const { user } = authentication;

    return { user, form };
}
  
const actionCreators = {
    getForm: FormActions.getForm,
    getFormList: FormActions.getFormList,
    getFormQuery: FormActions.getFormQuery,
    getFormESQuery: FormActions.getFormESQuery,
    logout: UserActions.logout
}

const connectedFormQueryPage = connect(mapState, actionCreators)(FormQueryPage);
export { connectedFormQueryPage as FormQueryPage };
