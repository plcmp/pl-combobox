import { html, PlElement, css } from "polylib";
import '@plcmp/pl-icon-button';
import '@plcmp/pl-checkbox';

class PlComboboxList extends PlElement {
    static properties = {
        text: { type: String },
        valueList: { type: Array },
        _vdata: { type: Array },
        data: { type: Array },
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
            padding: var(--space-md) 0;
            display: flex;
            flex-direction: column;
            overflow: auto;
            gap: 4px;
        }

        .comboitem {
            box-sizing: border-box;
            padding: 4px var(--space-sm);
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
    `;


    static plainTemplate = html`
        <template d:repeat="{{_vdata}}">
            <div class="comboitem" on-click="[[_onSelect]]">
                <div inner-h-t-m-l="[[_itemText(item, textProperty, _search)]]"></div>
            </div>
        </template>`

    static simpleTreeTemplate = html`
        <template d:repeat="{{_vdata}}">
            <div class="comboitem" on-click="[[_onSelect]]">
                <pl-icon-button style$="[[_getRowMargin(item)]]" variant="link" iconset="pl-default" icon="[[_getTreeIcon(item)]]" on-click="[[_onTreeNodeClick]]"></pl-icon-button>
                <div inner-h-t-m-l="[[_itemText(item, textProperty, _search)]]"></div>
            </div>
        </template>`

    static simpleMultiTemplate = html`
        <template d:repeat="{{_vdata}}">
            <div class="comboitem" on-click="[[_onSelect]]">
                <pl-checkbox checked="[[_itemSelected(item, valueList)]]"></pl-checkbox>
                <div inner-h-t-m-l="[[_itemText(item, textProperty, _search)]]"></div>
            </div>
        </template>`

    static treeMultiTemplate = html`
        <template d:repeat="{{_vdata}}">
            <div class="comboitem" on-click="[[_onSelect]]">
                <pl-icon-button style$="[[_getRowMargin(item)]]" variant="link" iconset="pl-default" icon="[[_getTreeIcon(item)]]" on-click="[[_onTreeNodeClick]]"></pl-icon-button>
                <pl-checkbox checked="[[_itemSelected(item, valueList)]]"></pl-checkbox>
                <div inner-h-t-m-l="[[_itemText(item, textProperty, _search)]]"></div>
            </div>
        </template>`


    static template = html`[[getTemplate()]]`;
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
        if(this.tree && this.selectOnlyLeaf && this.data.find(x => x[this.pkeyProperty] == event.model.item[this.keyProperty])) {
            return;
        }

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

    _getRowMargin(item) {
        return `margin-left: ${item._level * 12 + 'px'}`;
    }

    _getTreeIcon(item) {
        if (!item._haschildren) {
            return '';
        }

        return item._opened ? 'triangle-down' : 'triangle-right';
    }


    getTemplate() {
        if(!this.tree && !this.multiSelect) {
            return PlComboboxList.plainTemplate;
        }

        if(this.tree && !this.multiSelect) {
            return PlComboboxList.simpleTreeTemplate;
        }

        if(!this.tree && this.multiSelect) {
            return PlComboboxList.simpleMultiTemplatel;
        }

        if(this.tree && this.multiSelect) {
            return PlComboboxList.treeMultiTemplate;
        }
    }
}

customElements.define('pl-combobox-list', PlComboboxList);