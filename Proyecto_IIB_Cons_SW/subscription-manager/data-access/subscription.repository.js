const STORAGE_KEY = 'epn_subs';

export class SuscripcionesRepository {
  loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  saveAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  findAll() {
    return this.loadAll();
  }

  findById(id) {
    return this.loadAll().find(s => s.id === id);
  }

  findByEmail(email) {
    return this.loadAll().find(s => s.email === email);
  }

  create(data) {
    const all = this.loadAll();
    const nueva = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    all.push(nueva);
    this.saveAll(all);
    return nueva;
  }

  update(id, changes) {
    const all = this.loadAll();
    const idx = all.findIndex(s => s.id === id);
    if (idx < 0) return null;
    const old = { ...all[idx] };
    all[idx] = { ...all[idx], ...changes, updatedAt: new Date().toISOString() };
    this.saveAll(all);
    return { updated: all[idx], old };
  }

  delete(id) {
    const all = this.loadAll();
    const sub = all.find(s => s.id === id);
    this.saveAll(all.filter(s => s.id !== id));
    return sub;
  }

  count() {
    return this.loadAll().length;
  }
}

export const suscripcionesRepo = new SuscripcionesRepository();