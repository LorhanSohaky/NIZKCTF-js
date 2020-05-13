import Vue from "vue";
import Vuex from "vuex";
import createLogger from "vuex/dist/logger";
import VuexPersist from "vuex-persist";
import fromUnixTime from "date-fns/fromUnixTime";

import { acceptedSubmissions } from "@/services/firebase";

const plugins = [];

const DEV = process.env.NODE_ENV !== "production";

Vue.use(Vuex);

const vuexLocalStorage = new VuexPersist({
  key: "pw2winctf",
  storage: window.localStorage
});
plugins.push(vuexLocalStorage.plugin);

if (DEV) {
  const logger = createLogger();
  plugins.push(logger);
}

export default new Vuex.Store({
  strict: DEV,
  state: {
    theme: "default",
    language: "en",
    token: null,
    user: null,
    team: null,
    repository: null,
    solvedChallenges: [],
    pendingPullRequests: []
  },
  mutations: {
    setTheme(state, theme) {
      state.theme = theme;
    },
    setLanguage(state, language) {
      state.language = language;
    },
    setToken(state, token) {
      state.token = token;
    },
    setUser(state, user) {
      state.user = user;
    },
    setTeam(state, team) {
      state.team = team;
    },
    setRepository(state, repository) {
      state.repository = repository;
    },
    setPendingPullRequests(state, pendingPullRequests) {
      state.pendingPullRequests = pendingPullRequests;
    },
    addPullRequestToPending(state, pullRequest) {
      state.pendingPullRequests = [...state.pendingPullRequests, pullRequest];
    },
    removePullRequestFromPending(state, pullRequest) {
      const list = [...state.pendingPullRequests];
      const index = list.indexOf(pullRequest);
      list.splice(index, 1);
      state.pendingPullRequests = list;
    },
    setSolvedChallenges(state, acceptedSubmissions) {
      state.solvedChallenges = acceptedSubmissions
        ? acceptedSubmissions
            .reduce((reducer, { taskStats, team }) => {
              Object.keys(taskStats).forEach(challenge => {
                reducer.push({
                  team,
                  challenge,
                  datetime: taskStats[challenge].time,
                  date: fromUnixTime(taskStats[challenge].time).toLocaleString()
                });
              });
              return reducer;
            }, [])
            .sort((a, b) => b.datetime - a.datetime)
        : [];
    }
  },
  actions: {
    setTheme(context, theme) {
      context.commit("setTheme", theme);
    },
    setLanguage(context, language) {
      context.commit("setLanguage", language);
    },
    setToken(context, token) {
      context.commit("setToken", token);
    },
    setUser(context, user) {
      context.commit("setUser", user);
    },
    setTeam(context, team) {
      context.commit("setTeam", team);
    },
    setRepository(context, repository) {
      context.commit("setRepository", repository);
    },
    setPendingPullRequests(context, pendingPullRequests) {
      context.commit("setPendingPullRequests", pendingPullRequests);
    },
    addPullRequestToPending(context, pullRequest) {
      context.commit("addPullRequestToPending", pullRequest);
    },
    removePullRequestFromPending(context, pullRequest) {
      context.commit("removePullRequestFromPending", pullRequest);
    },
    startFirebaseConnection(context) {
      acceptedSubmissions.on("value", snapshot => {
        context.commit("setSolvedChallenges", snapshot.val());
      });
    }
  },
  getters: {
    language: state => state.language,
    token: state => state.token,
    team: state => state.team,
    user: state => state.user,
    solvedChallenges: state => state.solvedChallenges
  },
  modules: {},
  plugins
});
