describe('Basic Test Suite', () => {
  it('should run basic math operations', () => {
    expect(2 + 2).toBe(4);
    expect(5 * 3).toBe(15);
    expect(10 - 4).toBe(6);
  });

  it('should handle string operations', () => {
    expect('Stadium' + ' AI').toBe('Stadium AI');
    expect('test'.toUpperCase()).toBe('TEST');
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it('should work with objects', () => {
    const user = { name: 'Test User', role: 'fan' };
    expect(user).toHaveProperty('name');
    expect(user.role).toBe('fan');
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });
});