import {redirectToErrorPage} from "../reducers/error";
import {store} from '../index'

export const parseJSON = errorMessage => response => {
    if (response.ok) {
        return response.json()
    } else {
        response.body && response.text().then(responseBody => {
            if (response.status === 401 || response.status === 403) {
                window.location = '/unauthorized'
            } else {
                store.dispatch(redirectToErrorPage(`${errorMessage} - ${responseBody}`));
            }
        })

        throw new Error(response)
    }
}

export const getResource = (path, onFailure) => () => {
    return fetch(path, {
        credentials: 'same-origin'
    })
        .then(parseJSON(`Failed to retrieve resource at ${path}`))
        .catch(error => {
            if (onFailure) {
                onFailure(error);
            }
        });
}

export const postResource = (path, body, onFailure) => () => {
    return fetchSubmit(path, 'POST', body)
        .then(parseJSON(`Failed to retrieve resource at ${path}`))
        .catch(error => {
            if (onFailure) {
                onFailure(error);
            }
        });
}

export const fetchSubmit = (url, method, values, headers = {}) => {
    return fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/hal+json',
            ...headers
        },
        body: JSON.stringify(values),
        credentials: 'same-origin'
    })
}

export const fetchUpload = (url, file, headers = {}) => {
    var data = new FormData();
    data.append('file', file);

    return fetch(url, {
        method: 'POST',
        headers: {
            ...headers
        },
        body: data,
        credentials: 'same-origin'
    })
}
