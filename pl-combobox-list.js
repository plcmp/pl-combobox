import { html, PlElement, css } from "polylib";
import '@plcmp/pl-virtual-scroll';

class PlComboboxList extends PlElement {
    static get properties() {
        return {
            text: { type: String },
            value: {  },
            data: { type: Array, value: () => [] },
            selected: { value: undefined },
            multiSelect: { type: Boolean },
            tree: { type: Boolean },
            selectOnlyLeaf: { type: Boolean },
            textProperty: { type: String },
            valueProperty: { type: String },
            keyProperty: { type: String, },
            parentProperty: { type: String },
            _search: { type: String }
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
                gap: 8px;
            }

            .comboitem:hover {
                background-color: var(--grey-lightest)
            }

            pl-icon[hidden] {
                display: none;
            }
        `;
    }

    static get template() {
        return html`
            <div id="ddContainer">
                <template d:repeat="[[_filterData(data, text, _search)]]">
                    <div class="comboitem" on-click="[[_onSelect]]">
                        <pl-checkbox checked="[[_itemSelected(item, value)]]"></pl-checkbox>
                        <div inner-h-t-m-l="[[_itemText(item, text, _search)]]"></div>
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

    _itemSelected(item, value) {
        return this.multiSelect && value.includes(item[this.valueProperty]);
    }

    _itemText(item, text, _search) {
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
        let item = event.model.item;
        if(this.multiSelect) {
            item.__checked = !item.__checked;
        }

        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                model: item
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

        return row._opened ? 'minus' : 'plus';
    }
}

customElements.define('pl-combobox-list', PlComboboxList);