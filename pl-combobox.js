import { PlElement, html, css } from "polylib";

import './pl-combobox-list.js';

import '@plcmp/pl-dropdown';
import '@plcmp/pl-icon';
import '@plcmp/pl-iconset-default';
import '@plcmp/pl-input';
import '@plcmp/pl-dom-if';
import "@plcmp/pl-checkbox";
import "@plcmp/pl-data-tree";

class PlCombobox extends PlElement {
    static properties = {
        data: { type: Array, value: () => [], observer: '_dataObserver' },
        value: { type: String, value: null, observer: '_valueObserver' },
        text: { type: String, observer: '_textObserver' },
        selected: { type: Object, value: null },
        contentWidth: { type: Number },
        labelWidth: { type: Number },
        fitInto: { type: Object, value: null },
        direction: { type: String, value: 'down' },
        label: { type: String },
        required: { type: Boolean },
        readonly: { type: Boolean },
        invalid: { type: Boolean },
        variant: { type: String, value: 'text', observer: '_variantObserver' },
        orientation: { type: String },
        stretch: { type: Boolean, reflectToAttribute: true },
        placeholder: { type: String },
        textProperty: { type: String, value: 'text' },
        valueProperty: { type: String, value: 'value' },
        titleProperty: { type: String, value: undefined },

        disabled: { type: Boolean, reflectToAttribute: true },
        hidden: { type: Boolean, reflectToAttribute: true },

        allowCustomValue: { type: Boolean, value: false },
        multiSelect: { type: Boolean, value: false, observer: '_multiSelectObserver' },
        valueList: { type: Array, value: () => [], observer: '_valueListObserver' },
        selectedList: { type: Array, value: () => [], observer: '_multiSelectObserver' },

        tree: { type: Boolean, observer: '_treeModeChange' },
        keyProperty: { type: String },
        pkeyProperty: { type: String },
        hasChildProperty: { type: String, value: '_haschildren' },

        selectOnlyLeaf: { type: Boolean, value: false },

        _filteredData: { type: Array, value: () => [] },
        _vdata: { type: Array, value: () => [] },
        _openedForDomIf: { type: Boolean, value: false },
        _ddOpened: { type: Boolean, value: false, observer: '_ddOpenedObserver' },
        _searchText: { type: Boolean, value: null, observer: '_searchTextObserver' },
       
        _multiTemplate: { type: Object }
    };

    static css = css`
        :host {
            min-width: 0;
            flex-shrink: 0;
        }

        :host([hidden]) {
            display: none;
        }

        :host([stretch]) {
            width: 100%;
            flex-shrink: 1;
        }

        :host([disabled]) pl-icon-button {
            pointer-events: none;
        }

        :host([disabled]) pl-icon {
            pointer-events: none;
        }

        pl-dropdown {
            background: var(--surface-color);
            border-radius: var(--border-radius);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            border: 1px solid var(--grey-lightest);
            max-height: var(--dropdown-max-height, 254px);
            min-width: var(--content-width);
            box-sizing: border-box;
            overflow: auto;
            padding: 0;
            overscroll-behavior: contain;
        }

        .tag {
            display: flex;
            background: var(--primary-lightest);
            box-sizing: border-box;
            border: 1px solid var(--primary-light);
            border-radius: 4px;
            width: auto;
            height: 20px;
            max-width: 140px;
            padding: 0 4px;
            align-items: center;
        }

        .tag pl-icon {
            cursor: pointer;
        }

        .tag:last-child {
            margin-right: 2px;
        }

        .tag-text {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .tag-cont {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }

        .text-cont {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    `;
    static tagsTemplate = html`
        <div slot="input" class="tag-cont">
            <div class="tag" d:repeat="[[selectedList]]">
                <span class="tag-text" title$=[[_getTagTitle(item)]]>[[_getTagText(item)]]</span>
                <pl-icon hidden="[[readonly]]" iconset="pl-default" size="16" icon="close-s" on-click="[[_onRemoveTagClick]]"></pl-icon>
            </div>
        </div>
    `;

    static textTemplate = html`
        <div slot="input" class="text-cont" title$=[[_getTitleForMulti(selectedList)]]>
            [[_getTextForMulti(selectedList)]]
        </div>
    `;
    static template = html`
        <pl-input content-width="[[contentWidth]]" label-width="[[labelWidth]]" stretch="[[stretch]]" readonly="[[readonly]]"
            disabled="{{disabled}}" id="input" placeholder="[[_getPlaceholder(placeholder, valueList)]]" value="{{text}}" required="[[required]]"
            invalid="{{invalid}}" label="[[label]]" orientation="[[orientation]]" on-click="[[_onOpen]]">
            <slot name="prefix" slot="prefix"></slot>
            [[_multiTemplate]]
            <slot name="suffix" slot="suffix"></slot>
            <slot name="label-prefix" slot="label-prefix"></slot>
            <slot name="label-suffix" slot="label-suffix"></slot>
            <pl-icon-button variant="link" hidden="[[_isClearHidden(value, valueList, readonly)]]" slot="suffix"
                iconset="pl-default" size="12" icon="close" on-click="[[_onClearClick]]"></pl-icon-button>
            <pl-icon-button variant="link" hidden="[[readonly]]" iconset="pl-default" slot="suffix" size="16"
                icon="[[_getIcon(_ddOpened)]]" on-click="[[_onToggle]]"></pl-icon-button>
        </pl-input>
        <pl-dropdown id="dd" opened="{{_ddOpened}}" fit-into=[[fit]] direction="[[direction]]">
            <pl-dom-if if="{{_openedForDomIf}}">
                <template>
                    <pl-combobox-list data="[[data]]" tree="[[tree]]" multi-select="[[multiSelect]]"
                        select-only-leaf="[[selectOnlyLeaf]]" _vdata="{{_vdata}}" text-property="[[textProperty]]"
                        value-property="[[valueProperty]]" key-property="[[keyProperty]]" pkey-property="[[pkeyProperty]]"
                        selected="{{selected}}" on-select="[[_onSelect]]" text="[[text]]" value-list="[[valueList]]"
                        _search="[[_searchText]]">
                    </pl-combobox-list>
                </template>
            </pl-dom-if>
        </pl-dropdown>
        <pl-data-tree bypass="[[!tree]]" key-field="[[keyProperty]]" pkey-field="[[pkeyProperty]]"
            has-child-field="[[hasChildProperty]]" in="{{_filteredData}}" out="{{_vdata}}">
        </pl-data-tree>
    `;

    connectedCallback() {
        super.connectedCallback();
        this.$.input.validators = [this.validator.bind(this)];

        this.$.dd._close = e => {
            let path = e.composedPath();
            if (!path.includes(this)) {
                e.preventDefault();
                e.stopPropagation();
                this.$.dd.close();
            }
        }

        const resizeObserver = new ResizeObserver(() => {
            this.$.dd.style.minWidth = this.$.input.$.inputContainer.offsetWidth + 'px';
            this.$.dd.reFit(this.$.input.$.inputContainer, this.fitInto);
        });

        resizeObserver.observe(this.$.input.$.inputContainer);

        setTimeout(() => {
            if (this.data?.control) {
                this._treeModeChange();
            }
        }, 0);
    }

    _getPlaceholder(placeholder, valueList){
        if(this.multiSelect && this.valueList.length > 0) {
            return '';
        } else{
            return placeholder || '';
        }
    }

    _variantObserver() {
        this._multiSelectObserver();
    }

    _multiSelectObserver() {
        if(this.multiSelect) {
            if(this._multiTemplate != PlCombobox.tagsTemplate && this.variant == 'tags') {
                this._multiTemplate = PlCombobox.tagsTemplate;
            } 

            if(this._multiTemplate != PlCombobox.textTemplate && this.variant == 'text') {
                this._multiTemplate = PlCombobox.textTemplate;
            }
        }
    }

    validator() {
        let messages = [];
        if (this.multiSelect) {
            if (this.valueList.length === 0 && this.required) {
                messages.push('Значение не может быть пустым');
            }
        } else if ((this.value === null || this.value === undefined) && this.required) {
            messages.push('Значение не может быть пустым');
        }

        return messages.length > 0 ? messages.join(';') : undefined;
    }

    _searchTextObserver(text) {
        if (text != null && text !== '') {
            if (this.tree) {
                let parents = new Set();
                let filtered = new Set(this.data.filter(x => x[this.textProperty].toLowerCase().includes(text.toLowerCase())));
                filtered.forEach((item) => {
                    if (item[this.pkeyProperty] != null && item[this.pkeyProperty] !== undefined) {
                        parents.add(item[this.pkeyProperty]);
                    }
                });
                for (const p of parents) {
                    const item = this.data.find(i => i[this.keyProperty] == p);
                    if (item) {
                        filtered.add(item);
                        if (item[this.pkeyProperty] !== null && item[this.pkeyProperty] !== undefined) parents.add(item[this.pkeyProperty]);
                    }
                }

                filtered.forEach((i) => {
                    if (parents.has(i[this.keyProperty])) {
                        i[this.hasChildProperty] = true;
                        i._opened = true;
                    }
                });
                this.splice('_filteredData', 0, this._filteredData.length, ...filtered);
            } else {
                this._filteredData = this.data.filter(x => x[this.textProperty].toLowerCase().includes(text.toLowerCase()));
            }
        } else {
            this.splice('_filteredData', 0, this._filteredData.length, ...this.data);
        }
    }

    _isClearHidden() {
        return this.readonly || !this.value && this.valueList.length === 0;
    }

    _onOpen() {
        if (!this.readonly && !this.disabled) {
            this._openedForDomIf = true;
            this.$.dd.open(this.$.input.$.inputContainer, this.fitInto);
            this.$.dd.style.minWidth = this.$.input.$.inputContainer.offsetWidth + 'px';
            this._searchText = null;
        }
    }

    _treeModeChange() {
        if (this.data.control && this.tree) {
            this.data.control.treeMode = {
                hidValue: undefined,
                keyField: this.keyProperty,
                hidField: this.pkeyProperty
            };
        } else if (this.data.control) {
            delete this.data.control.treeMode;
        }
    }

    _getIcon(opened) {
        return opened ? 'chevron-up' : 'chevron-down';
    }

    _onToggle(event) {
        if (!this.readonly) {
            if (this.$.dd.opened) {
                event.stopImmediatePropagation();
                this.$.dd.close();
            } else {
                this._openedForDomIf = true;
                this.$.dd.open(this.$.input.$.inputContainer, this.fitInto);
                this.$.dd.style.minWidth = this.$.input.$.inputContainer.offsetWidth + 'px';
                this._searchText = null;
            }
        }
    }

    __setValue(value) {
        this.inStack = true;
        this.value = value;
        this.inStack = false;
    }

    _onRemoveTagClick(event) {
        event.stopPropagation();

        this.splice('valueList', this.valueList.findIndex(x => x == event.model.item[this.valueProperty]), 1);
    }

    _getTagText(item) {
        return item[this.textProperty];
    }

    _getTagTitle(item) {
        return this.titleProperty ? item[this.titleProperty] : item[this.textProperty];
    }

    __setText(text) {
        this.inStack = true;
        this.text = text;
        this.inStack = false;
    }

    _dataObserver(newData) {
        if (this.inStack) { return; }

        if (!newData || !newData.length) {
            return;
        }

        if (newData[0] instanceof Object) {
            this.inStack = true;
            this.set('data', newData);
            this.set('_filteredData', Array.from(this.data));
            this.inStack = false;
        } else {
            let d = [];
            newData.forEach((text) => {
                d.push({ [this.valueProperty]: text, [this.textProperty]: text });
            });
            this.set('data', d);
            this.set('_filteredData', Array.from(this.data));
        }
        if (this.multiSelect) {
            this._valueListObserver(this.valueList, null, { action: 'upd', value: this.valueList })
        } else {
            const val = this.__storedValue !== undefined ? this.__storedValue : this.value;
            if (this.get('value') !== val) {
                this.set('value', val);
            } else {
                this.__setText();
                this._valueObserver(val);
            }
            this.__storedValue = undefined;

        }
    }

    _onClearClick(event) {
        this.text = null;

        if (this.multiSelect) {
            this.splice('valueList', 0, this.valueList.length);
        } else {
            this.value = null;
        }
        this.__storedValue = undefined;

        event.stopImmediatePropagation();
    }
    _valueObserver(newValue) {
        if (this.inStack) { return; }
        let found;
        if (this.data) {
            found = this.data.find(item => {
                const value = item[this.valueProperty];
                if (value == newValue) {
                    this.selected = item;
                    this.__setText(item[this.textProperty]);
                    return true;
                }
            });
        }
        if (!found) {
            if (this.allowCustomValue || newValue === null || newValue === undefined) {
                this.__setText(newValue);
            } else {
                this.__storedValue = this.__storedValue !== undefined ? this.__storedValue : newValue;
            }
        } else {
            this.__storedValue = undefined;
        }

        this.$.input.validate();
    }

    _valueListObserver(newValues, old, mut) {
        let elementsToAdd = [];
        let elementsToDelete = [];
        if (this.data && this.data.length > 0) {
            if (mut.action === 'upd') {
                elementsToDelete = this.selectedList.map(x => x[this.valueProperty]);
                elementsToAdd = newValues;
            }

            if (mut.action === 'splice' && mut.added?.length > 0) {
                elementsToAdd = mut.added;
            }

            if (mut.action === 'splice' && mut.deleted?.length > 0) {
                elementsToDelete = mut.deleted || [];
            }

            elementsToDelete.forEach((del => {
                if (this.selectedList.find(x => x[this.valueProperty] == del)) {
                    this.splice('selectedList', this.selectedList.findIndex(x => x[this.valueProperty] == del), 1);
                }
            }));

            elementsToAdd.forEach((add) => {
                if (!this.selectedList.find(x => x[this.valueProperty] == add))
                    this.push('selectedList', this.data.find(x => x[this.valueProperty] == add));
            });

            this.$.input.validate();
        }
    }

    _textObserver(newValue, oldValue, mut) {
        if (this.inStack) { return; }
        if (!this._searchText) {
            let fValue = false;
            this.data && (fValue = this.data.find((item) => {
                const text = item[this.textProperty];
                if (text === newValue) {
                    this.__setValue(item[this.valueProperty]);
                    return true;
                }
                return false;
            }));
            if (!fValue) {
                if (!this.allowCustomValue) {
                    this.__setText(mut.value);
                } else {
                    this.__setValue(newValue);
                }
            }
        } else {
            if (this.allowCustomValue) {
                this.__setValue(newValue);
            }
        }
        this._searchText = this._ddOpened ? this.text : null;
    }

    _ddOpenedObserver() {
        if (!this._ddOpened) {
            this._valueObserver(this.value);
        }
    }

    _onSelect(event) {
        this._searchText = null;
        if (this.multiSelect) {
            let idx = this.valueList.findIndex(x => x == event.detail.model[this.valueProperty]);
            if (idx === -1) {
                this.push('valueList', event.detail.model[this.valueProperty]);
            } else {
                this.splice('valueList', idx, 1);
            }

            this.__setText(null);
        } else {
            this.__setValue(event.detail.model[this.valueProperty]);
            this.__setText(event.detail.model[this.textProperty]);

            this.selected = event.detail.model;
            this._ddOpened = false;
        }
    }

    _getTextForMulti(selectedList) {
        return selectedList.length === 0 ? '' : (this._getTagText(selectedList[0]) + (selectedList.length > 1 ? ` (+${this.selectedList.length - 1})` : ''));
    }

    _getTitleForMulti(selectedList) {
        if(selectedList.length == 0) {
            return '';
        } 
        
        return selectedList.map(x => this._getTagText(x)).join('\n');
    }
}

customElements.define('pl-combobox', PlCombobox);