import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { FormActions, UserActions } from 'Actions'

import {
    Button,
    AppBar,
    Toolbar,
    IconButton,
    List,
    ListItem,
    ListItemText,
    TextField,
    Card, 
    Grid, 
    Collapse
} from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Autocomplete from '@material-ui/lab/Autocomplete';
import matchSorter from 'match-sorter'

import MenuIcon from '@material-ui/icons/Menu'; 

class FormSelectorPage extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            menuIsOpen: false,
            dialogOpen: false
        }
        
        this.recentlyAccessed = this.recentlyAccessed.bind(this)
        this.createNewForm = this.createNewForm.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
        this.menuToggle = this.menuToggle.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.updateText = this.updateText.bind(this)
        this.goToResponse = this.goToResponse.bind(this)
    }
    
    async componentDidMount() {        
        await this.props.getFormList();
        await this.props.getRecentlyAccessedList(0);
    }

    handleLogout() {
        this.props.logout();
        return this.props.history.push(`/login`)
    }

    menuToggle() {
        this.setState({ menuIsOpen: !this.state.menuIsOpen })
    }

    createNewForm() {  
        let forms = []
        if (this.props.form.hasOwnProperty("forms")){
            forms = new Map(this.props.form.forms.map(el => [el.title, el.diagnosticProcedureID]))
        }
        if (this.state && this.state.formID){
            return this.props.history.push({pathname:`/form/${this.state.formID}`, state: {patientID: this.state.patientID, responseID:null}})
        } else if (this.state && this.state.value) {
            return this.props.history.push({pathname:`/form/${forms.get(this.state.value)}`, state: {patientID: this.state.patientID, responseID:null}})
        }
    }

    goToResponse(diagnosticProcedureID, responseID) {
        var hist = {pathname:`/form/${diagnosticProcedureID}`, state: {responseID: responseID, patientID:null}}
        return this.props.history.push(hist)
    }
    
    recentlyAccessed() {    
        if (this.props.form && !this.props.form.loading && this.props.form.formResponses.length > 0 && this.props.form.hasOwnProperty("formResponses")){
            return this.props.form.formResponses.map(el =>
                <div style={{backgroundColor: 'white', margin: 10}}>
                    <ListItem>
                        <Button style={{background: "white"}} onClick={() => {this.goToResponse(el.diagnosticProcedureID, el._id)}} >
                            <ListItemText primary={el.diagnosticProcedureID} 
                                secondary={`Last accessed on ${[el.updatedAt.slice(0, 4), "-", el.updatedAt.slice(4, 6), "-", el.updatedAt.slice(6, 8)].join('')}`}
                            />
                        </Button>
                    </ListItem>   
                    <Collapse in={el.persistentLinks.length > 0}>
                        <List style={{fontSize:"4"}}>
                            <p style={{marginLeft: 25, marginTop: -10, fontSize:"13px"}}>Persistent Links: </p>
                            <ListItem style={{marginTop: -17, marginBottom: 0}}>    
                                {persistentLink(el.persistentLinks)}
                            </ListItem>
                        </List>
                    </Collapse>    
                </div>
            )
        } else {
            return <h5 style={{marginLeft: "15px"}}>No recently accessed forms.</h5>
            //return <p>No recently accessed forms</p>
        }
    }

    handleClose(){
        this.setState({ dialogOpen: false })
    }

    updateText =  function(event) {
        this.setState({patientID: event.target.value});
      }

    render() {
        console.log("Form Selector loading:", this.props)
        return(
            <div class="formSelectionWrapper">
                <AppBar position="static" className="appBar">
                    <Toolbar>
                        <h3 className="noselect">Form Selection</h3>
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
                        <Button href='/upload'> Form Manager </Button>
                        <br/>
                        <Button href='/query'> Query Runner </Button>
                        <br/>
                        <Button href='/docs'> Documentation </Button>
                        <br/>
                        <Button onClick={this.handleLogout}>Logout</Button>
                    </List>
                </Collapse>

                <br/>
                <div class="content">
                    <Autocomplete 
                        options={this.props.form.forms}
                        filterOptions={filterOptions}
                        onChange={(event, newValue) => {
                            this.setState({value: newValue});
                          }}
                        onClose={() => {this.setState({dialogOpen: true})}}
                        className="formSelector"
                        renderInput={params => (
                            <TextField {...params} label="Select new form" variant="outlined" fullWidth />
                        )}
                    />
                    
                    <br/>
                    <Card style={{background:"lightgrey"}} className="formSelector">
                        <h4 style={{margin: "15px 15px 0px 15px"}}>Recently Accessed Forms: </h4>
                        <List>
                            {this.props.form && this.props.form.formResponses && this.recentlyAccessed()}
                        </List>
                    </Card>
                </div>
                <Dialog className="patientDialog" open={this.state.dialogOpen} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Fill Form</DialogTitle>
                        <DialogContent>
                        <DialogContentText>
                            Please Enter the Patient ID
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="patientID"
                            label="PatientID"
                            type="text"
                            onChange={this.updateText}
                            fullWidth
                        />
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.createNewForm} color="primary">
                            Submit
                        </Button>
                        </DialogActions>
                    </Dialog>
            </div>
        )
    }

}


const filterOptions = (options, { inputValue }) =>
    matchSorter(options.map(el => {
        return el.title
    }, []), inputValue);   

const persistentLink = (links) => links.map(el => 
    // <Link to={`persistent/${el.link}`} style={{marginLeft: 25}}>{el.timestamp}</Link>)
    <a target="_blank" href={`/persistent/${el.link}`} style={{marginLeft: 25, fontSize: "13px"}}>{el.timestamp}</a>)
    

// TODO: Change
function mapState(state) {
    const { form, authentication } = state;
    const { user } = authentication;

    return { user, form };
}
  
const actionCreators = {
    getForm: FormActions.getForm,
    getFormList: FormActions.getFormList,
    getRecentlyAccessedList: FormActions.getRecentlyAccessedList,
    logout: UserActions.logout
}

const connectedFormSelectorPage = connect(mapState, actionCreators)(FormSelectorPage);
export { connectedFormSelectorPage as FormSelectorPage };
