export default class Themes {
  static level = 0;

  static _themes = [
    { prairie: 'prairie' },
    { desert: 'desert' },
    { arctic: 'arctic' },
    { mountain: 'mountain' },
  ];

  static get themes() {
    return this._themes;
  }

  static nextLevel() {
    const themeObj = this._themes[this.level];
    this.level += 1;
    if (this._themes.length === this.level) {
      this.level = 0;
    }
    return Object.values(themeObj);
  }
}
