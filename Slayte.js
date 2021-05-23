import axios from 'axios';
import promiseRetry from 'promise-retry';

// current content: { value: 'old1' }
const REMOTE_RESOURCE_1_URL = 'http://example.com/api/resource1'
// current content: { value: 'old2' }
const REMOTE_RESOURCE_2_URL = 'http://example.com/api/resource2'

const old_body_1 = { value: 'old1' };
const new_body_1 = { value: 'new1' };
const new_body_2 = { value: 'new2' };

_attemptUpdateRemoteAPI = () => {
    return promiseRetry({ retries: 3 }, retry => {
        return axios({
            method: 'put',
            url: REMOTE_RESOURCE_1_URL,
            data: new_body_1
        })
        .catch(retry);
    })
        .catch(err => {
            console.log('Can not update Resource 1');
            return Promise.reject({
                message: 'Failed!'
            });
        })
        .then(response => {
            return promiseRetry({ retries: 3 }, retry => {
                return axios({
                    method: 'put',
                    url: REMOTE_RESOURCE_2_URL,
                    data: new_body_2
                })
                .catch(retry);
            });
        })
        .catch(err => {
            if (err.message === 'Failed!')
                return Promise.reject(err);

            console.log('Can not update Resource 2, undone Resource 1');
            return promiseRetry({ retries: 10 }, retry => {
                return axios({
                    method: 'put',
                    url: REMOTE_RESOURCE_1_URL,
                    data: old_body_1
                })
                .catch(retry);
            });
        });
}

updateRemoteApi = () => {
    return this._attemptUpdateRemoteAPI();
}