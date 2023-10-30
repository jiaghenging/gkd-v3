// import Cookies from 'js-cookie'

const state = {
  userMsg:'',
  token:'',
}

const mutations = {
  SET_USER(state,data){
	  state.userMsg=data;
  },
  SET_TOKEN(state,data){
  	  state.token=data;
  }
}

const actions = {
  setUser({ commit }, data) {
    commit('SET_SIZE', data)
  },
  setUser({ commit }, data) {
    commit('SET_TOKEN', data)
  },
}

export default {
  state,
  mutations,
  actions
}
