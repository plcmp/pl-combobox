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
            display: flex;
            flex-direction: column;
            overflow: auto;
            max-height: var(--pl-dropdown-max-height, 254px);
        }

        .comboitem {
            display: flex;
            box-sizing: border-box;
            width: 100%;
            height: fit-content;

            align-items: center;
            cursor: pointer;

            padding: 0px calc(var(--pl-base-size) / 4);
            font: var(--pl-text-font);
            color: var(--pl-text-color);
        }

        .comboitem:hover {
            background-color: var(--pl-primary-lightest)
        }

        .text {
            display: flex;
            min-height: var(--pl-base-size);
            width: 100%;
            align-text: center;
            align-items: center;
        }
    `;

    static plainTemplate = html`
        <div class="comboitem" on-click="[[_onSelect]]" d:repeat="{{_vdata}}">
            <div class="text" inner-h-t-m-l="[[_itemText(item, textProperty, _search)]]"></div>
        </div>`

    static simpleTreeTemplate = html`
        <div class="comboitem" on-click="[[_onSelect]]" d:repeat="{{_vdata}}">
            <pl-icon-button style$="[[_getRowMargin(item)]]" variant="link" iconset="pl-default" icon="[[_getTreeIcon(item)]]" on-click="[[_onTreeNodeClick]]"></pl-icon-button>
            <div class="text" inner-h-t-m-l="[[_itemText(item, textProperty, _search)]]"></div>
        </div>`

    static simpleMultiTemplate = html`
        <div class="comboitem" on-click="[[_onSelect]]" d:repeat="{{_vdata}}">
            <pl-checkbox checked="[[_itemSelected(item, valueList)]]"></pl-checkbox>
            <div class="text" inner-h-t-m-l="[[_itemText(item, textProperty, _search)]]"></div>
        </div>`

    static treeMultiTemplate = html`
        <div class="comboitem" on-click="[[_onSelect]]" d:repeat="{{_vdata}}">
            <pl-icon-button style$="[[_getRowMargin(item)]]" variant="link" iconset="pl-default" icon="[[_getTreeIcon(item)]]" on-click="[[_onTreeNodeClick]]"></pl-icon-button>
            <pl-checkbox checked="[[_itemSelected(item, valueList)]]"></pl-checkbox>
            <div class="text" inner-h-t-m-l="[[_itemText(item, textProperty, _search)]]"></div>
        </div>`

    static template = html`[[getTemplate()]]`;
    
    _itemSelected(item, valueList) {
        return this.multiSelect && valueList.filter(x => x == item[this.valueProperty]).length > 0;
    }

    _itemText(item, textProperty, search) {
        if (search) {
            const txtPart = item[this.textProperty].match(new RegExp(search, 'i'));
            return item[this.textProperty].replaceAll(' ', '&nbsp;').replace(new RegExp(search, 'i'), `<b>${txtPart?.[0]}</b>`);
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
            return PlComboboxList.simpleMultiTemplate;
        }

        if(this.tree && this.multiSelect) {
            return PlComboboxList.treeMultiTemplate;
        }
    }
}

customElements.define('pl-combobox-list', PlComboboxList);