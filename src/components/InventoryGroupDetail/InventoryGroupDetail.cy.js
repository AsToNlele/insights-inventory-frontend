import {
  BREADCRUMB,
  EMPTY_STATE_ICON,
  EMPTY_STATE_TITLE,
  MENU_ITEM,
  MENU_TOGGLE,
  MODAL_CONTENT,
  TAB_BUTTON,
  TAB_CONTENT,
} from '@redhat-cloud-services/frontend-components-utilities';
import groupDetailFixtures from '../../../cypress/fixtures/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C.json';
import {
  featureFlagsInterceptors,
  groupDetailInterceptors,
  groupsInterceptors,
  hostsInterceptors,
} from '../../../cypress/support/interceptors';
import InventoryGroupDetail from './InventoryGroupDetail';

const TEST_GROUP_ID = '620f9ae75A8F6b83d78F3B55Af1c4b2C';

const mountPage = () =>
  cy.mountWithContext(InventoryGroupDetail, undefined, {
    groupId: TEST_GROUP_ID,
  });

before(() => {
  cy.mockWindowInsights(); // with all permissions
});

const waitPageLoad = () =>
  cy.get('h1').should('not.have.text', 'Loading workspace details');

describe('test data', () => {
  it('the group has no hosts', () => {
    expect(groupDetailFixtures.results[0].host_count).to.equal(0);
  });
});

describe('group detail page', () => {
  beforeEach(() => {
    featureFlagsInterceptors.edgeParitySuccessful(); // enable edge parity in this describe block
  });

  it('renders empty state when no hosts', () => {
    groupDetailInterceptors.successful();
    hostsInterceptors.emptyHybridSystems();

    mountPage();

    cy.wait('@emptyHybridSystems');
    cy.get(EMPTY_STATE_TITLE).contains('No systems added');
    cy.get(EMPTY_STATE_ICON);
  });

  it('name from server is rendered in header and breadcrumb', () => {
    groupDetailInterceptors.successful();
    mountPage();

    cy.wait('@getGroupDetail');
    cy.get('h1').contains(groupDetailFixtures.results[0].name);
    cy.get(BREADCRUMB)
      .find('li')
      .last()
      .should('have.text', groupDetailFixtures.results[0].name);
  });

  it('skeletons rendered while fetching data', () => {
    groupDetailInterceptors['long responding']();
    mountPage();

    cy.get(BREADCRUMB).find('li').last().find('.pf-v5-c-skeleton');
    cy.get('h1').find('.pf-v5-c-skeleton');
    cy.get('.pf-v5-c-empty-state').find('.pf-v5-c-spinner');
  });

  it('can rename group', () => {
    groupsInterceptors['successful with some items'](); // intercept modal validation requests
    groupDetailInterceptors.successful();
    groupDetailInterceptors['patch successful']();
    mountPage();

    cy.get(MENU_TOGGLE).should('be.enabled').click();
    cy.get(MENU_ITEM).contains('Rename').click();

    cy.get(MODAL_CONTENT).find('input').type('1');
    cy.get(MODAL_CONTENT).find('button[type=submit]').click();

    cy.wait('@patchGroup')
      .its('request.body')
      .should('deep.equal', {
        name: `${groupDetailFixtures.results[0].name}1`,
      });
    cy.wait('@getGroupDetail'); // the page is refreshed after submition
  });

  it('can delete an empty group', () => {
    groupDetailInterceptors.successful();
    groupDetailInterceptors['delete successful']();
    mountPage();

    cy.get(MENU_TOGGLE).should('be.enabled').click();
    cy.get(MENU_ITEM).contains('Delete').click();

    cy.get(`div[class="pf-v5-c-check"]`).click();
    cy.get(`button[type="submit"]`).click();
    cy.wait('@deleteGroup')
      .its('request.url')
      .should('contain', groupDetailFixtures.results[0].id);
  });
});

describe('integration with rbac', () => {
  describe('no permissions', () => {
    before(() => {
      cy.mockWindowInsights({ userPermissions: [] });
    });

    beforeEach(() => {
      groupDetailInterceptors.successful();
      mountPage();
    });

    it('should render only id in header and breadcrumb', () => {
      cy.get('h1').contains(groupDetailFixtures.results[0].id);
      cy.get(BREADCRUMB)
        .find('li')
        .last()
        .should('have.text', groupDetailFixtures.results[0].id);
    });

    it('should not see any tabs', () => {
      cy.get(TAB_CONTENT).should('not.exist');
      cy.get(TAB_BUTTON).should('not.exist');
    });

    it('empty state is rendered', () => {
      cy.get('h5').should('have.text', 'Workspace access permissions needed');
    });

    it('actions are disabled', () => {
      cy.get(MENU_TOGGLE).should('be.disabled');
    });

    it('should show group id', () => {
      cy.get('h1').should('have.text', TEST_GROUP_ID);
    });
  });

  describe('only groups read permissions', () => {
    before(() => {
      cy.mockWindowInsights({
        userPermissions: [
          {
            permission: 'inventory:groups:read',
            resourceDefinitions: [
              {
                attributeFilter: {
                  key: 'group.id',
                  operation: 'equal',
                  value: TEST_GROUP_ID,
                },
              },
            ],
          },
        ],
      });
    });

    beforeEach(() => {
      groupDetailInterceptors.successful();
      mountPage();
    });

    it('actions are disabled', () => {
      cy.get(MENU_TOGGLE).should('be.disabled');
    });

    it('should not allow to see systems', () => {
      cy.get(TAB_CONTENT)
        .find('h5')
        .should('have.text', 'Access needed for systems in this workspace');
    });

    it('should allow to see the workspace info tab', () => {
      cy.get(TAB_BUTTON).contains('Workspace info').click();
      cy.get(TAB_CONTENT)
        .eq(1) // <- workaround since PF renders both tab contents and hides the first
        .find('.pf-v5-c-card__title') // TODO: tie to OUIA
        .should('have.text', 'User access configuration');
    });

    it('should fetch and display group name instead id', () => {
      cy.wait('@getGroupDetail');
      cy.get('h1').should('have.text', groupDetailFixtures.results[0].name);
    });
  });

  describe('only group read and hosts read permission', () => {
    before(() => {
      cy.mockWindowInsights({
        userPermissions: [
          'inventory:hosts:read',
          {
            permission: 'inventory:groups:read',
            resourceDefinitions: [
              {
                attributeFilter: {
                  key: 'group.id',
                  operation: 'equal',
                  value: TEST_GROUP_ID,
                },
              },
            ],
          },
        ],
      });
    });

    beforeEach(() => {
      groupDetailInterceptors.successful();
      mountPage();
      waitPageLoad();
    });

    it('actions are disabled', () => {
      cy.get(MENU_TOGGLE).should('be.disabled');
      cy.get('button').contains('Add systems').shouldHaveAriaDisabled();
    });

    it('should allow to see systems', () => {
      cy.get(TAB_CONTENT).find('h4').should('have.text', 'No systems added');
    });

    it('should fetch and display group name instead id', () => {
      cy.wait('@getGroupDetail');
      cy.get('h1').should('have.text', groupDetailFixtures.results[0].name);
    });
  });
});
