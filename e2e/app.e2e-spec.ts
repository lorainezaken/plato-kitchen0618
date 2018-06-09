import { PlatoPage } from './app.po';

describe('plato App', () => {
  let page: PlatoPage;

  beforeEach(() => {
    page = new PlatoPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
