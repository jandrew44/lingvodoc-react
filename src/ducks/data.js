import { combineReducers } from 'redux';
import { fromJS } from 'immutable';
// Actions
export const REQUEST_PUBLISHED_DICTS = '@data/REQUEST_PUBLISHED_DICTS';
export const REQUEST_PERSPECTIVE = '@data/REQUEST_PERSPECTIVE';
export const DICTS_SET = '@data/DICTS_SET';
export const PERSPECT_SET = '@data/PERSPECT_SET';

// Reducers
function dictionaries(state = [], action = {}) {
  switch (action.type) {
    case DICTS_SET:
      return action.payload;
    default:
      return state;
  }
}

const perspectivesInit = fromJS({});
function perspectives(state = perspectivesInit, action = {}) {
  switch (action.type) {
    case PERSPECT_SET:
      return state.merge(action.payload.perspectives);
    default:
      return state;
  }
}

function loading(state = false, action = {}) {
  switch (action.type) {
    case REQUEST_PUBLISHED_DICTS:
      return true;
    case DICTS_SET:
      return false;
    default:
      return state;
  }
}

export default combineReducers({
  loading,
  dictionaries,
  perspectives,
});

// Action Creators
export function requestPublished() {
  return { type: REQUEST_PUBLISHED_DICTS };
}

export function requestPerspective(payload) {
  return { type: REQUEST_PERSPECTIVE, payload };
}

export function setDictionaries(payload) {
  return { type: DICTS_SET, payload };
}

export function setPerspectives(payload) {
  return { type: PERSPECT_SET, payload };
}
