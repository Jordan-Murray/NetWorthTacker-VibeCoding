import { jest } from '@jest/globals';

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...cls) => cls.forEach(c => set.add(c)),
    remove: (...cls) => cls.forEach(c => set.delete(c)),
    contains: cls => set.has(cls),
  };
}

describe('modalModule', () => {
  let modalContainer;
  let modalBody;
  let styleTag;
  let head;
  let body;

  beforeEach(() => {
    modalContainer = { classList: createClassList(['modal-hidden']), style: {} };
    modalBody = { innerHTML: '' };
    styleTag = null;
    head = { appendChild: jest.fn(tag => { styleTag = tag; }) };
    body = { style: {} };

    global.document = {
      getElementById: jest.fn(id => {
        if (id === 'modal-container') return modalContainer;
        if (id === 'modal-body') return modalBody;
        if (id === 'force-modal-style') return styleTag;
        return null;
      }),
      createElement: jest.fn(() => ({ id: '', textContent: '' })),
      head,
      body,
      querySelectorAll: jest.fn(() => []),
    };
    global.window = {};
  });

  afterEach(() => {
    delete global.document;
    delete global.window;
    jest.resetModules();
  });

  test('showModal updates DOM state', async () => {
    const { showModal } = await import('../js/modules/modalModule.js');
    showModal('<p>Hello</p>', 'test');
    expect(modalBody.innerHTML).toBe('<p>Hello</p>');
    expect(modalContainer.classList.contains('modal-visible')).toBe(true);
    expect(head.appendChild).toHaveBeenCalled();
    expect(body.style.overflow).toBe('hidden');
  });

  test('hideModal hides modal and restores overflow', async () => {
    const { hideModal } = await import('../js/modules/modalModule.js');
    hideModal();
    expect(modalContainer.classList.contains('modal-hidden')).toBe(true);
    expect(body.style.overflow).toBe('');
  });
});

describe('financialTablesUI', () => {
  let yearSelect;
  let showModalMock;

  beforeEach(() => {
    yearSelect = { value: '2024' };
    global.document = {
      getElementById: jest.fn(id => (id === 'year-select' ? yearSelect : null)),
    };
    showModalMock = jest.fn();
    jest.unstable_mockModule('../js/modules/modalModule.js', () => ({
      showModal: showModalMock,
    }));
  });

  afterEach(() => {
    delete global.document;
    jest.resetModules();
  });

  test('showAddAssetModal renders asset form', async () => {
    const { showAddAssetModal } = await import('../js/modules/financialTablesUI.js');
    showAddAssetModal();
    expect(showModalMock).toHaveBeenCalled();
    const [content, type] = showModalMock.mock.calls[0];
    expect(type).toBe('add-asset');
    expect(content).toContain('Add New Asset');
  });
});

describe('navigationModule', () => {
  let navDash;
  let navAssets;
  let dashSection;
  let assetsSection;
  let dispatched;

  beforeEach(() => {
    navDash = { href: '#dashboard', classList: createClassList(['active']) };
    navAssets = { href: '#assets-liabilities', classList: createClassList([]) };
    dashSection = { id: 'dashboard', classList: createClassList(['active-section']), style: {} };
    assetsSection = { id: 'assets-liabilities', classList: createClassList(['hidden-section']), style: {} };
    dispatched = null;

    global.document = {
      getElementById: jest.fn(id => {
        if (id === 'dashboard') return dashSection;
        if (id === 'assets-liabilities') return assetsSection;
        return null;
      }),
      querySelector: jest.fn(sel => {
        if (sel === '#main-nav a[href="#assets-liabilities"]') return navAssets;
        if (sel === '#main-nav a[href="#dashboard"]') return navDash;
        return null;
      }),
      querySelectorAll: jest.fn(sel => {
        if (sel === '#main-nav a') return [navDash, navAssets];
        if (sel === 'main > section') return [dashSection, assetsSection];
        return [];
      }),
      dispatchEvent: jest.fn(event => {
        dispatched = event;
      }),
    };
    global.window = { scrollTo: jest.fn(), refreshFinancialTables: jest.fn() };
    global.history = { pushState: jest.fn() };
  });

  afterEach(() => {
    delete global.document;
    delete global.window;
    delete global.history;
    jest.resetModules();
  });

  test('navigateToSection activates target section and link', async () => {
    const { navigateToSection } = await import('../js/modules/navigationModule.js');
    navigateToSection('assets-liabilities');
    expect(assetsSection.classList.contains('active-section')).toBe(true);
    expect(dashSection.classList.contains('hidden-section')).toBe(true);
    expect(navAssets.classList.contains('active')).toBe(true);
    expect(dispatched.type).toBe('navigationChanged');
  });
});

describe('yearManagerUI', () => {
  let yearSelect;
  let dataStore;

  beforeEach(() => {
    yearSelect = {
      value: '',
      innerHTML: '',
      appendChild: jest.fn(),
      dispatchEvent: jest.fn(),
    };
    global.document = {
      getElementById: jest.fn(id => (id === 'year-select' ? yearSelect : null)),
      createElement: jest.fn(() => ({ value: '', textContent: '' })),
    };
    dataStore = {
      getYears: jest.fn(() => [2023, 2024]),
      addYear: jest.fn(),
    };
    jest.unstable_mockModule('../js/modules/enhancedDataService.js', () => ({
      getDataStore: () => dataStore,
    }));
  });

  afterEach(() => {
    delete global.document;
    jest.resetModules();
  });

  test('populateYearSelect inserts years and selects given year', async () => {
    const { populateYearSelect } = await import('../js/modules/yearManagerUI.js');
    await populateYearSelect('2024');
    expect(yearSelect.innerHTML).toBe('');
    expect(yearSelect.appendChild).toHaveBeenCalledTimes(2);
    expect(yearSelect.value).toBe('2024');
    expect(yearSelect.dispatchEvent).toHaveBeenCalled();
  });
});
