import React from 'react';
import { connect } from 'react-redux';
import { Axios } from 'Helpers';

import {
    AppBar,
    Toolbar,
    IconButton,
    Collapse,
    Button,
    Card,
    CardContent,
    List,
    Divider,
    Grid,
    makeStyles,
    Fade
} from '@material-ui/core';

import {
    Section,
    Question,
    RadioInput,
    ChecklistInput,
    TextInput
} from 'Components/Form';

import MenuIcon from '@material-ui/icons/Menu'; 
import { FormActions, UserActions } from 'Actions';
import PersistentFormDialog from '../../Components/Dialog';

const FormStyle = makeStyles(theme => ({
    grid: {
        flex: 0.5,
        flexDirection: 'row',
    },
    wrapper: {
        flex: 1
    }
}));

class FormTestPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
        }
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.menuToggle = this.menuToggle.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    menuToggle() {
        this.setState({ menuIsOpen: !this.state.menuIsOpen })
    }

    handleLogout() {
        this.props.logout();
        return this.props.history.push(`/login`)
    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.diagnosticProcedureID) {
            let diagnosticProcedureID = this.props.match.params.diagnosticProcedureID;
            await this.props.getForm(diagnosticProcedureID);
            if(this.props.location && this.props.location.state && this.props.location.state.responseID != null) {
                await this.props.getAnswer(this.props.location.state.responseID);

            } else if(this.props.location && this.props.location.state && this.props.location.state.patientID != null) {
            //} else if (this.props.form.response === undefined || this.props.form.response._id === undefined) {
                await this.props.getResponse(diagnosticProcedureID, this.props.form.responseID, this.props.location.state.patientID, 0);
                await this.props.getAnswer(this.props.form.response['_id']);
            }

            if(this.props.form == null || this.props.form.response == null) {
                console.log("SOMETHING WWENT TERRIBLY WRONG")
            }
        }        
    }

    closeDialog() {
        this.setState({
            ...this.state,
            dialogOpen: false,
        });
    }

    openDialog() {
        this.setState({
            ...this.state,
            dialogOpen: true,
        });
    }

    onSubmit(){
        this.props.submitResponse(this.props.form.response);
        this.openDialog();
    }

    render() {
        console.log(this.props.form.loadedForm)
        return (
            <React.Fragment>
                <AppBar position="static" className="appBar">
                    <Toolbar>
                        {/*<h3 className="noselect"></h3>*/}
                        <div className="menuButton">
                            <IconButton edge="start" color="inherit" aria-label="menu" 
                                onClick={ this.menuToggle }>
                                <MenuIcon/>
                            </IconButton>
                        </div>
                    </Toolbar>
                </AppBar>
                <Collapse in={this.state.menuIsOpen} className="appBar menuDropdown">
                    <List>
                        <Button href='/formSelector'> Form Selection </Button>
                        <br/>
                        <Button href='/upload'> Form Manager </Button>
                        <br/>
                        <Button href='/query'> Query Runner </Button>
                        <br/>
                        <Button href='/docs'> Documentation </Button>
                        <br/>
                        <Button onClick={this.handleLogout}>Logout</Button>
                    </List>
                </Collapse>

                <Fade in={!this.props.form.loadedForm || this.props.match.params.diagnosticProcedureID != this.props.form.loadedForm.metadata.diagnosticProcedureID}>
                    <div class="spinWrapper">
                        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div> 
                    </div>
                </Fade>
                <Fade in={this.props.form.loadedForm}>
                <Grid className="wrapper">
                    <Grid className="content">
                        <Card className="header">
                            <CardContent>
                                    {this.props.form && this.props.form.loadedForm && this.props.form.loadedForm.metadata &&
                                        this.props.match.params.diagnosticProcedureID == this.props.form.loadedForm.metadata.diagnosticProcedureID &&
                                        <h1>
                                            {this.props.form.loadedForm.metadata.title}
                                        </h1>
                                    }
                                    {this.props.form && this.props.form.loadedForm && this.props.form.loadedForm.metadata &&
                                        this.props.match.params.diagnosticProcedureID == this.props.form.loadedForm.metadata.diagnosticProcedureID &&
                                        <p>
                                            <strong>Diagnostic Procedure ID:</strong> {this.props.form.loadedForm.metadata.diagnosticProcedureID}
                                        </p>
                                    }

                                    {this.props.form && this.props.form.response &&
                                        this.props.match.params.diagnosticProcedureID == this.props.form.loadedForm.metadata.diagnosticProcedureID &&
                                        <p>
                                            <strong>Patient ID:</strong> {this.props.form.response.patientID}
                                        </p> 
                                    }

                                    {this.props.form && this.props.form.response &&
                                        this.props.match.params.diagnosticProcedureID == this.props.form.loadedForm.metadata.diagnosticProcedureID &&
                                        <p>
                                            <strong>Form Filler ID:</strong> {this.props.form.response.formFillerID}
                                        </p>  
                                    }

                            </CardContent>
                        </Card>
                        <Grid>
                        {this.props.form && this.props.form.loadedForm && 
                                this.props.match.params.diagnosticProcedureID == this.props.form.loadedForm.metadata.diagnosticProcedureID &&
                                <Button className="submitButton" variant="contained" color="primary" onClick={this.onSubmit}>Submit</Button>}
                        </Grid>
                        <List children={
                            this.props.form && this.props.form.loadedForm && this.props.form.loadedForm.roots && 
                            this.props.match.params.diagnosticProcedureID == this.props.form.loadedForm.metadata.diagnosticProcedureID &&
                            Object.keys(this.props.form.loadedForm.roots).map(section => {
                                return (
                                    <div className="section" key={section}>
                                        <Section
                                            section={section}
                                            sectionTitle={this.props.form.loadedForm.metadata.sections[section]}
                                            roots={this.props.form.loadedForm.roots[section]}
                                            getChildrenFn={this.props.form.loadedForm.getChildrenFn}
                                            addAnswer={this.props.addAnswer}
                                            response={this.props.form.response}
                                        />
                                    </div>
                                );
                            })
                        } component='ul'/>
                        <Grid className="footer">
                            {this.props.form && this.props.form.loadedForm && 
                                this.props.match.params.diagnosticProcedureID == this.props.form.loadedForm.metadata.diagnosticProcedureID &&
                                <Button className="submitButton" variant="contained" color="primary" onClick={this.onSubmit}>Submit</Button>}
                        </Grid>
                    </Grid>
                </Grid>
                </Fade>
                <PersistentFormDialog
                    onClose={this.closeDialog}
                    open={this.state.dialogOpen}
                    persistentFormLink={this.props.form.persistentFormLink}
                />
            </React.Fragment>
        );
    }
}

function mapState(state) {
    console.log(state);
    const { form, authentication } = state;
    const { user } = authentication;
    return { user, form };
}

const actionCreators = {
    getFormList: FormActions.getFormList,
    getForm: FormActions.getForm,
    getResponse: FormActions.getResponse,
    getResponseFromID: FormActions.getResponseByFormResponse,
    getAnswer: FormActions.getAnswer,
    addAnswer: FormActions.addFieldAnswer,
    submitResponse: FormActions.submitResponse,
    logout: UserActions.logout
}

const connectedFormTestPage = connect(mapState, actionCreators)(FormTestPage);
export { connectedFormTestPage as FormTestPage };