import axios from 'axios'

export function fetch_solution(sol_id){
    return axios.get('solution/' + sol_id + '/').then(
        function(response){
            //TODO: add error checking
            return response.data.solution;
        }
    ).catch(
        function(error){
            return undefined;
        }
    );
}

export function create_solution(map_id, code, shared){
    return axios.post('solution/', {solution:{map: map_id, code: code, shared: shared}}).then(
        function(response){
            //TODO: add error checking
            return response.data.sol_id;
        }).catch(function(error)
        {
            return undefined;
        }
    );
}


export function fetch_solution_list(user_id, map_id, self, details, page_no, page_size){
    return axios.get(`solution/`, {
        params: {
            user: user_id,
            map: map_id,
            self: self,
            details: details,
            page_no: page_no,
            page_size: page_size
        }
    }).then(
        function(response){
            //TODO: add error checking
            return response.data.list;
        }
    ).catch(
        function(error){
            return undefined;
        }
    );
}