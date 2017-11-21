import axios from 'axios'

export function fetch_solution(sol_id){
    return axios.get('solution/' + sol_id + '/').then(
        function(response){
            //TODO: add error checking
            return response.data.solution;
        }
    ).catch(
        function(error){
            return {};
        }
    );
}
