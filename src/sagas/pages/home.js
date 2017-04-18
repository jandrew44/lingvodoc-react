import { call, take, put, fork } from 'redux-saga/effects';
import { normalize } from 'normalizr-immutable';
import { publishedDicts } from 'api';
import { published, meta, perspectiveListSchema } from 'api/perspective';
import { REQUEST_PUBLISHED_DICTS, setDictionaries, setPerspectives } from 'ducks/data';

export function* getDictionaries() {
  const { data } = yield call(publishedDicts);
  if (data) {
    yield put(setDictionaries(data));
  }
}

export function* getPerspectives() {
  const [part1, part2] = yield [
    call(published),
    call(meta),
  ];
  if (part1.data) {
    yield put(setPerspectives(normalize(part1.data, perspectiveListSchema).entities));
  }
  if (part2.data) {
    yield put(setPerspectives(normalize(part2.data, perspectiveListSchema).entities));
  }
}

export function* dataFlow() {
  yield fork(getDictionaries);
  yield fork(getPerspectives);
}

export default function* home() {
  while (yield take(REQUEST_PUBLISHED_DICTS)) {
    yield* dataFlow();
  }
}
