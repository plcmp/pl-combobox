import { html, PlElement, css } from "polylib";
import '@plcmp/pl-virtual-scroll';
import '@plcmp/pl-repeat';

class PlListbox extends PlElement {
    static get properties() {
        return {
            text: { type: String },
            data: { type: Array, value: () => [] },
            selected: { value: undefined },
            multiSelect: { type: Boolean },
            tree: { type: Boolean },
            selectOnlyLeaf: { type: Boolean },
            textProperty: { type: String },
            valueProperty: { type: String },
            keyProperty: { type: String, },
            parentProperty: { type: String },
            _search: { type: String },
            _ddOpened: { type: Boolean },
            _selectedMap: { type: Map }
        }
    };

    static get css() {
        return css`
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            #ddContainer {
                display: block;
            }

            pl-virtual-scroll {
                display: none;
            }

            .comboitem {
                box-sizing: border-box;
                padding: 0 var(--space-sm);
                min-height: var(--base-size-md);
                width: 100%;
                font: var(--text-font);
                color: var(--text-color);
                display: flex;
                align-items: center;
                cursor: pointer;
            }

            .comboitem:hover {
                background-color: var(--grey-lightest)
            }

            pl-icon[hidden] {
                display: none;
            }

            .tree-cell {
                cursor: pointer;
                width: var(--base-size-xs);
                user-select: none;
            }
        `;
    }

    static get template() {
        return html`
            <div id="ddContainer">
                <template d:repeat="[[_filterData(data, text, _search)]]">
                    <div class="comboitem" on-click="[[_onSelect]]">
                        <pl-checkbox hidden="[[!multiSelect]]" checked="[[_computeSelected(item,_selectedMap)]]" variant="horizontal"
                            on-click="[[_onCheckboxClick]]"></pl-checkbox>
                        <span class="tree-cell" style$="[[_getRowPadding(item)]]">
                            [[_getTreeIcon(item)]]
                        </span>
                        <div inner-h-t-m-l="[[_itemText(item, text, _search, _ddOpened)]]"></div>
                    </div>
                </template>
            </div>
        `;
    }

    _filterData(data, text, _search) {
        let res = data;

        if (_search && text) {
            const fltr = this.caseSensetiveFilter ? text : text.toLowerCase();
            res = this.data ? this.data.filter(item => {
                const i = item[this.textProperty];
                return i && (this.caseSensetiveFilter ? i.indexOf(fltr) : i.toLowerCase().indexOf(fltr)) !== -1;
            }) : [];
        }

        return res;
    }

    _computeSelected(item) {
        return this.multiSelect && this._selectedMap && this._selectedMap.has(item) || false;
    }

    _onCheckboxClick(event) {
        let item = event.model.item;
        if (!this._selectedMap.has(item)) {
            this._selectedMap.set(item, item)
        } else {
            this._selectedMap.delete(item)
        }
    }


    _itemText(item, text, _search, _ddOpened) {
        let res;
        if (text) {
            if (_search) {
                /**
                 * Данное условие отрабатывает во время поиска необходимой записи в combobox (когда производится ввод/вставка символов в input)
                 */
                const txtPart = item[this.textProperty].match(new RegExp(text, 'i'));
                res = txtPart && item[this.textProperty].replace(new RegExp(text, 'i'), `<b>${txtPart[0]}</b>`);
            } else {
                /**
                 * Отображает выбранную запись в списке, как помеченную. Остальные же отображаются стандартным текстом.
                 */
                res = (this.selected === item) ? `<b>${item[this.textProperty]}</b>` : item[this.textProperty];
            }
        } else {
            res = item[this.textProperty]
        }
        return res;
    }

    connectedCallback() {
        super.connectedCallback();
        this._selectedMap = new Map();
    }

    _onSelect(event) {
        if (!this.multiSelect)
            this.dispatchEvent(new CustomEvent('select', {
                detail: {
                    model: event.model.item
                },
                bubbles: true
            }));
    }

    _getRowPadding(row) {
        if (this.tree) {
            return `padding-left: ${row._level * 12 + 'px'}`;
        }
        return 'display:none;';
    }

    _getTreeIcon(row) {
        if (!row._haschildren) {
            return '';
        }

        return row._opened ? '-' : '+';
    }
}

customElements.define('pl-listbox', PlListbox);