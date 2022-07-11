import { html, PlElement, css } from "polylib";
import '@plcmp/pl-virtual-scroll';

class PlComboboxList extends PlElement {
    static properties = {
        text: { type: String },
        valueList: { type: Array },
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

    static css = css`
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

    static template = html`
            <div id="ddContainer">
                <template d:repeat="[[data]]">
                    <div class="comboitem" on-click="[[_onSelect]]">
                        <pl-checkbox hidden="[[!multiSelect]]" checked="[[_itemSelected(item, valueList)]]"></pl-checkbox>
                        <div inner-h-t-m-l="[[_itemText(item, textProperty)]]"></div>
                    </div>
                </template>
            </div>
        `;

    _itemSelected(item, valueList) {
        return this.multiSelect && valueList.includes(item[this.valueProperty]);
    }

    _itemText(item, textProperty) {
        return item[textProperty];
    }

    _onSelect(event) {
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

        return row._opened ? 'minus' : 'plus';
    }
}

customElements.define('pl-combobox-list', PlComboboxList);