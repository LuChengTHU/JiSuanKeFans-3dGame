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
