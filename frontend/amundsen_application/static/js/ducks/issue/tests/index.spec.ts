import { testSaga, expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import globalState from 'fixtures/globalState';

import { Issue, NotificationType } from 'interfaces';
import { throwError } from 'redux-saga-test-plan/providers';
import * as API from '../api/v0';

import reducer, {
  createIssue,
  createIssueSuccess,
  createIssueFailure,
  getIssues,
  getIssuesSuccess,
  getIssuesFailure,
  IssueReducerState,
} from '../reducer';

import {
  CreateIssue,
  GetIssues,
  GetIssuesRequest,
  CreateIssueRequest,
} from '../types';
import {
  getIssuesWatcher,
  getIssuesWorker,
  createIssueWatcher,
  createIssueWorker,
} from '../sagas';

describe('issue ducks', () => {
  let tableKey: string;
  let issue: Issue;
  let issues: Issue[];
  let key;
  let title;
  let description;
  let ownerIds;
  let frequentUserIds;
  let priorityLevel;
  let projectKey;
  let resourceName;
  let resourcePath;
  let owners;
  let sender;
  let total;
  let openCount;
  let allIssuesUrl;
  let openIssuesUrl;
  let closedIssuesUrl;

  beforeAll(() => {
    tableKey = 'key';
    key = 'table';
    title = 'stuff';
    description = 'This is a test';
    ownerIds = ['user1@email.com', 'user2@email.com'];
    frequentUserIds = ['user1@email.com', 'user2@email.com'];
    priorityLevel = 'P2';
    projectKey = 'Project';
    resourceName = 'resource_name';
    resourcePath = 'resource_path';
    owners = ['email@email'];
    sender = 'sender@email';
    issue = {
      issue_key: 'issue_key',
      title: 'title',
      url: 'http://url',
      status: 'Open',
      priority_display_name: 'P2',
      priority_name: 'Major',
    };

    issues = [issue];
    total = 0;
    openCount = 0;
    allIssuesUrl = 'testurl';
    openIssuesUrl = 'testurl';
    closedIssuesUrl = 'testurl';
  });

  describe('actions', () => {
    it('getIssues - returns the action to submit feedback', () => {
      const action = getIssues(tableKey);
      const { payload } = action;
      expect(action.type).toBe(GetIssues.REQUEST);
      expect(payload.key).toBe(tableKey);
    });

    it('getIssuesSuccess - returns the action to process success', () => {
      const action = getIssuesSuccess(
        issues,
        total,
        openCount,
        allIssuesUrl,
        openIssuesUrl,
        closedIssuesUrl
      );
      expect(action.type).toBe(GetIssues.SUCCESS);
    });

    it('getIssuesFailure - returns the action to process failure', () => {
      const action = getIssuesFailure([]);
      expect(action.type).toBe(GetIssues.FAILURE);
    });

    it('createIssue - returns the action to create items', () => {
      const createIssuePayload = {
        key,
        title,
        description,
        owner_ids: ownerIds,
        frequent_user_ids: frequentUserIds,
        priority_level: priorityLevel,
        project_key: projectKey,
        resource_path: resourcePath,
      };
      const notificationPayload = {
        sender,
        recipients: owners,
        notificationType: NotificationType.DATA_ISSUE_REPORTED,
        options: {
          resource_name: resourceName,
          resource_path: resourcePath,
        },
      };

      const action = createIssue(createIssuePayload, notificationPayload);
      const { payload } = action;
      expect(action.type).toBe(CreateIssue.REQUEST);
      expect(payload.createIssuePayload.key).toBe(key);
      expect(payload.createIssuePayload.title).toBe(title);
      expect(payload.createIssuePayload.description).toBe(description);
      expect(payload.createIssuePayload.owner_ids).toBe(ownerIds);
      expect(payload.createIssuePayload.frequent_user_ids).toBe(
        frequentUserIds
      );
      expect(payload.createIssuePayload.priority_level).toBe(priorityLevel);
      expect(payload.createIssuePayload.project_key).toBe(projectKey);
      expect(payload.createIssuePayload.resource_path).toBe(resourcePath);
      expect(payload.notificationPayload.options.resource_name).toBe(
        resourceName
      );
      expect(payload.notificationPayload.options.resource_path).toBe(
        resourcePath
      );
      expect(payload.notificationPayload.recipients).toBe(owners);
    });

    it('createIssueFailure - returns the action to process failure', () => {
      const action = createIssueFailure();
      const { payload } = action;
      expect(action.type).toBe(CreateIssue.FAILURE);
      expect(payload.issue).toBe(undefined);
    });

    it('createIssueSuccess - returns the action to process success', () => {
      const action = createIssueSuccess(issue);
      const { payload } = action;
      expect(action.type).toBe(CreateIssue.SUCCESS);
      expect(payload.issue).toBe(issue);
    });
  });

  describe('reducer', () => {
    let testState: IssueReducerState;
    beforeAll(() => {
      const stateIssues: Issue[] = [];
      total = 0;
      openCount = 0;
      allIssuesUrl = 'testUrl';
      openIssuesUrl = 'testUrl';
      closedIssuesUrl = 'testUrl';
      testState = {
        total,
        openCount,
        allIssuesUrl,
        openIssuesUrl,
        closedIssuesUrl,
        isLoading: false,
        createIssueFailure: false,
        issues: stateIssues,
      };
    });

    it('should return the existing state if action is not handled', () => {
      expect(reducer(testState, { type: 'INVALID.ACTION' })).toEqual(testState);
    });

    it('should handle GetIssues.REQUEST', () => {
      expect(reducer(testState, getIssues(tableKey))).toEqual({
        issues: [],
        isLoading: true,
        createIssueFailure: false,
        allIssuesUrl: undefined,
        openIssuesUrl: undefined,
        closedIssuesUrl: undefined,
        total: 0,
        openCount: 0,
      });
    });

    it('should handle GetIssues.SUCCESS', () => {
      expect(
        reducer(
          testState,
          getIssuesSuccess(
            issues,
            total,
            openCount,
            allIssuesUrl,
            openIssuesUrl,
            closedIssuesUrl
          )
        )
      ).toEqual({
        issues,
        total,
        openCount,
        allIssuesUrl,
        openIssuesUrl,
        closedIssuesUrl,
        isLoading: false,
        createIssueFailure: false,
      });
    });

    it('should handle GetIssues.FAILURE', () => {
      expect(reducer(testState, getIssuesFailure([], 0, undefined))).toEqual({
        total,
        openCount,
        issues: [],
        isLoading: false,
        createIssueFailure: false,
        allIssuesUrl: undefined,
        openIssuesUrl: undefined,
        closedIssuesUrl: undefined,
      });
    });

    it('should handle CreateIssue.REQUEST', () => {
      const createIssuePayload = {
        key,
        title,
        description,
        owner_ids: ownerIds,
        frequent_user_ids: frequentUserIds,
        priority_level: priorityLevel,
        project_key: projectKey,
        resource_path: resourcePath,
      };
      const notificationPayload = {
        sender,
        recipients: owners,
        notificationType: NotificationType.DATA_ISSUE_REPORTED,
        options: {
          resource_name: resourceName,
          resource_path: resourcePath,
        },
      };
      expect(
        reducer(testState, createIssue(createIssuePayload, notificationPayload))
      ).toEqual({
        allIssuesUrl,
        openIssuesUrl,
        closedIssuesUrl,
        total,
        openCount,
        issues: [],
        isLoading: true,
        createIssueFailure: false,
      });
    });

    it('should handle CreateIssue.SUCCESS', () => {
      expect(reducer(testState, createIssueSuccess(issue))).toEqual({
        ...testState,
        issues: [issue],
        isLoading: false,
        createIssueFailure: false,
      });
    });

    it('should handle malformed CreateIssue.SUCCESS', () => {
      const successBody = createIssueSuccess(issue);
      successBody.payload.issue = undefined;
      expect(() => {
        reducer(testState, successBody);
      }).toThrow();
    });

    it('should handle CreateIssue.FAILURE', () => {
      expect(reducer(testState, createIssueFailure())).toEqual({
        total,
        openCount,
        allIssuesUrl,
        openIssuesUrl,
        closedIssuesUrl,
        issues: [],
        isLoading: false,
        createIssueFailure: true,
      });
    });
  });

  describe('sagas', () => {
    describe('getIssuesWatcher', () => {
      it('takes every getIssues.REQUEST with getIssuesWatcher', () => {
        testSaga(getIssuesWatcher)
          .next()
          .takeEvery(GetIssues.REQUEST, getIssuesWorker)
          .next()
          .isDone();
      });
    });

    describe('getIssuesWorker', () => {
      let action: GetIssuesRequest;
      beforeAll(() => {
        action = getIssues(tableKey);
        const {
          issues: gsIssues,
          total: gsTotal,
          openCount: gsOpenCount,
          allIssuesUrl: gsAllIssuesUrl,
          openIssuesUrl: gsOpenIssuesUrl,
          closedIssuesUrl: gsClosedIssuesUrl,
        } = globalState.issue;
        issues = gsIssues;
        total = gsTotal;
        openCount = gsOpenCount;
        allIssuesUrl = gsAllIssuesUrl;
        openIssuesUrl = gsOpenIssuesUrl;
        closedIssuesUrl = gsClosedIssuesUrl;
      });

      it('gets issues', () =>
        expectSaga(getIssuesWorker, action)
          .provide([
            [
              matchers.call.fn(API.getIssues),
              {
                issues,
                total,
                openCount,
                allIssuesUrl,
                openIssuesUrl,
                closedIssuesUrl,
              },
            ],
          ])
          .put(getIssuesSuccess(issues, total))
          .run());

      it('handles request error', () =>
        expectSaga(getIssuesWorker, action)
          .provide([[matchers.call.fn(API.getIssues), throwError(new Error())]])
          .put(getIssuesFailure([], 0, 0, undefined, undefined, undefined))
          .run());
    });

    describe('createIssueWatcher', () => {
      it('takes every createIssue.REQUEST with getIssuesWatcher', () => {
        testSaga(createIssueWatcher)
          .next()
          .takeEvery(CreateIssue.REQUEST, createIssueWorker)
          .next()
          .isDone();
      });
    });

    describe('createIssuesWorker', () => {
      let action: CreateIssueRequest;
      beforeAll(() => {
        const createIssuePayload = {
          key,
          title,
          description,
          owner_ids: ownerIds,
          frequent_user_ids: frequentUserIds,
          priority_level: priorityLevel,
          project_key: projectKey,
          resource_path: resourcePath,
        };
        const notificationPayload = {
          sender,
          recipients: owners,
          notificationType: NotificationType.DATA_ISSUE_REPORTED,
          options: {
            resource_name: resourceName,
            resource_path: resourcePath,
          },
        };
        action = createIssue(createIssuePayload, notificationPayload);
        issues = [issue];
      });

      it('creates a issue', () =>
        expectSaga(createIssueWorker, action)
          .provide([[matchers.call.fn(API.createIssue), issue]])
          .put(createIssueSuccess(issue))
          .run());

      it('handles request error', () =>
        expectSaga(createIssueWorker, action)
          .provide([
            [matchers.call.fn(API.createIssue), throwError(new Error())],
          ])
          .put(createIssueFailure())
          .run());
    });
  });
});
