import Validator from 'validator';
import isEmpty from './isEmpty';

export default function validateLoginInput(data) {
    let errors = {};
    data.username = !isEmpty(data.username) ? data.username : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if(!Validator.isLength(data.username, { min: 2, max: 30 })) {
        errors.username = 'Username must be between 2 to 30 chars';
    }
    
    if(Validator.isEmpty(data.username)) {
        errors.username = 'Username field is required';
    }

    if(!Validator.isLength(data.password, {min: 6, max: 30})) {
        errors.password = 'Password must have 6 chars';
    }

    if(Validator.isEmpty(data.password)) {
        errors.password = 'Password is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}