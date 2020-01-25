import React from 'react';

import {
    Dialog,
    Link,
    Button,
    Typography,
    IconButton,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import { withStyles } from '@material-ui/core/styles';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import Icon from '@mdi/react'
import { mdiClipboardText } from '@mdi/js';

const styles = theme => ({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    icon: {
        margin: "auto",
        display: "flex"
    },
});

const DialogTitle = withStyles(styles)(props => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });
  
const DialogContent = withStyles(theme => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const DialogActions = withStyles(theme => {
    console.log("dialog", theme);
    ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
})})(MuiDialogActions);

function PersistentFormDialog(props) {
    const { classes, open, onClose, persistentFormLink, theme, ...other } = props;
    console.log("@@@@@@", props);
    return (
        <Dialog
            className={classes.root}
            onClose={onClose}
            open={open}
            aria-labelledby="customized-dialog-title"
        >
            <DialogTitle id="customized-dialog-title" onClose={onClose}>
                <Typography variant="h3">
                    Response Submitted
                </Typography>
            </DialogTitle>
            <DialogContent dividers>

            <CopyToClipboard
                text={window.location.origin + `/persistent/${persistentFormLink}`}
            >
                <div style={{display:'flex', flexDirection:'column'}}>
                <Typography gutterBottom alignitems="center" style={{fontSize:"16px", wordBreak:"break-word"}}>
                    You can view your response using the link below<br/> 
                    or click the clipboard to copy the url. <br/>

                </Typography>
                <div style={{display:'flex', justifyContent:"space-evenly"}}>
                    <div style={{marginTop:"auto", marginBottom:"auto"}}>
                    <a target="_blank" href={`/persistent/${persistentFormLink}`}>{window.location.origin}/persistent/{persistentFormLink}</a>
                    </div>
                    <Icon className={classes.icon}
                            path={mdiClipboardText}
                            className="clipboard"
                            style={{cursor:'pointer', float:'right'}}
                            title="Clipboard"
                            size={3}
                        />
                </div>
                </div>
            </CopyToClipboard>

            </DialogContent>
            {/*<DialogActions>
                <Button component={Link} target="_blank" href={`/persistent/${persistentFormLink}`} color="primary">
                    <Typography variant="h4">
                        Go to response
                    </Typography>
                </Button>
            </DialogActions>*/}
        </Dialog>
    );
}

export default withStyles(styles, { withTheme: true })(PersistentFormDialog)