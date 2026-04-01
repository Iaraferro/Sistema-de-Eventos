import { routes } from './app.routes';

describe('routes', () => {
  it('keeps the public and admin flows mapped in Angular', () => {
    expect(routes.map((route) => route.path)).toEqual(
      expect.arrayContaining(['', 'admin/acesso', 'admin', '**']),
    );

    const adminRoute = routes.find((route) => route.path === 'admin');
    const adminChildren = adminRoute?.children?.map((route) => route.path) ?? [];

    expect(adminChildren).toEqual(
      expect.arrayContaining([
        'dashboard',
        'eventos',
        'participantes',
        'relatorios',
        'configuracoes',
      ]),
    );
  });
});
