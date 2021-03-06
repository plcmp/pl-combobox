import { html, PlElement, css } from "polylib";

class PlComboboxList extends PlElement {
    static properties = {
        text: { type: String },
        valueList: { type: Array },
        _vdata: { type: Array, value: () => [] },
        selected: { value: undefined },
        multiSelect: { type: Boolean },
        tree: { type: Boolean },
        keyProperty: { type: String },
        pkeyProperty: { type: String },

        selectOnlyLeaf: { type: Boolean },
        textProperty: { type: String },
        valueProperty: { type: String },
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
    `;

    static template = html`
            <div id="ddContainer">
                <template d:repeat="{{_vdata}}">
                    <div class="comboitem" on-click="[[_onSelect]]">
                        <span class="tree-cell" style$="[[_getRowPadding(item)]]">
                            <pl-icon-button variant="link" iconset="pl-default" icon="[[_getTreeIcon(item)]]"
                                on-click="[[_onTreeNodeClick]]"></pl-icon-button>
                        </span>
                        <pl-dom-if if="[[multiSelect]]">
                            <template>
                                <pl-checkbox checked="[[_itemSelected(item, valueList)]]"></pl-checkbox>
                            </template>
                        </pl-dom-if>
                        <div inner-h-t-m-l="[[_itemText(item, textProperty, _search)]]"></div>
                    </div>
                </template>
            </div>
        `;

    _itemSelected(item, valueList) {
        return this.multiSelect && valueList.includes(item[this.valueProperty]);
    }

    _itemText(item, textProperty, search) {
        if (search) {
            const txtPart = item[this.textProperty].match(new RegExp(search, 'i'));
            return item[this.textProperty].replace(new RegExp(search, 'i'), `<b>${txtPart?.[0]}</b>`);
        }

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

    _onTreeNodeClick(event) {
        event.stopPropagation();
        if (event.model.item._haschildren === false) {
            return;
        }
        let idx = this._vdata.indexOf(event.model.item);
        this.set(`_vdata.${idx}._opened`, !event.model.item._opened);
    }

    _getRowPadding(item) {
        if (this.tree) {
            return `padding-left: ${item._level * 12 + 'px'}`;
        }
        return 'display:none;';
    }

    _getTreeIcon(item) {
        if (!item._haschildren) {
            return '';
        }

        return item._opened ? 'triangle-down' : 'triangle-right';
    }
}

customElements.define('pl-combobox-list', PlComboboxList);