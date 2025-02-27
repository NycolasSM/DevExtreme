import $ from '../../core/renderer';
import registerComponent from '../../core/component_registrator';
import { extend } from '../../core/utils/extend';
import { getImageContainer } from '../../core/utils/icon';
import config from '../../core/config';
import messageLocalization from '../../localization/message';
import { current, isMaterial } from '../themes';
import Widget from '../widget/ui.widget';
import MultiselectDateBox from './ui.multiselect_date_box';
import TextEditorButtonCollection from '../text_box/texteditor_button_collection/index';
import DropDownButton from '../drop_down_editor/ui.drop_down_button';
import ClearButton from '../text_box/ui.text_editor.clear';
import { FunctionTemplate } from '../../core/templates/function_template';
import { isSameDates, isSameDateArrays } from './ui.date_range.utils';
import { each } from '../../core/utils/iterator';
import { camelize } from '../../core/utils/inflector';

const DATERANGEBOX_CLASS = 'dx-daterangebox';
const START_DATEBOX_CLASS = 'dx-start-datebox';
const END_DATEBOX_CLASS = 'dx-end-datebox';
const DATERANGEBOX_SEPARATOR_CLASS = 'dx-daterangebox-separator';
const DROP_DOWN_EDITOR_BUTTON_ICON = 'dx-dropdowneditor-icon';

const READONLY_STATE_CLASS = 'dx-state-readonly';

const TEXTEDITOR_INPUT_CLASS = 'dx-texteditor-input';

const ALLOWED_STYLING_MODES = ['outlined', 'filled', 'underlined'];

const SEPARATOR_ICON_NAME = 'to';

const EVENTS_LIST = [
    'KeyDown', 'KeyUp',
    'Change', 'Cut', 'Copy', 'Paste', 'Input',
    'EnterKey',
];

// STYLE dateRangeBox

class DateRangeBox extends Widget {
    _getDefaultOptions() {
        return extend(super._getDefaultOptions(), {
            acceptCustomValue: true,

            activeStateEnabled: true,

            applyButtonText: messageLocalization.format('OK'),

            applyValueMode: 'instantly',

            buttons: undefined,

            calendarOptions: {},

            cancelButtonText: messageLocalization.format('Cancel'),

            dateOutOfRangeMessage: messageLocalization.format('validation-range'),

            dateSerializationFormat: undefined,

            deferRendering: true,

            disabledDates: null,

            displayFormat: null,

            dropDownOptions: {},

            dropDownButtonTemplate: 'dropDownButton',

            endDate: null,

            focusStateEnabled: true,

            hoverStateEnabled: true,

            invalidDateMessage: messageLocalization.format('dxDateBox-validation-datetime'),

            isValid: true,

            startDateLabel: 'Start Date', // default value was ''

            endDateLabel: 'End Date', // default value was ''

            startDatePlaceholder: '',

            endDatePlaceholder: '',

            labelMode: 'static',

            max: undefined,

            maxLength: null,

            min: undefined,

            opened: false,

            openOnFieldClick: true,

            readOnly: false,

            showClearButton: false,

            showDropDownButton: true,

            spellcheck: false,

            startDate: null,

            stylingMode: config().editorStylingMode || 'outlined',

            text: '',

            todayButtonText: messageLocalization.format('dxCalendar-todayButtonText'),

            useHiddenSubmitElement: false,

            useMaskBehavior: false,

            validationError: null,

            validationErrors: null,

            validationMessageMode: 'auto',

            validationMessagePosition: 'auto',

            validationStatus: 'valid',

            value: [null, null],

            valueChangeEvent: 'change',

            onValueChanged: null,

            onOpened: null,

            onClosed: null,

            onKeyDown: null,

            onKeyUp: null,

            onChange: null,

            onInput: null,

            onCut: null,

            onCopy: null,

            onPaste: null,

            onEnterKey: null,
        });
    }

    _defaultOptionsRules() {
        return super._defaultOptionsRules().concat([
            {
                device: function() {
                    const themeName = current();
                    return isMaterial(themeName);
                },
                options: {
                    stylingMode: config().editorStylingMode || 'filled',
                    labelMode: 'floating'
                }
            }
        ]);
    }

    _createOpenAction() {
        this._openAction = this._createActionByOption('onOpened', {
            excludeValidators: ['disabled', 'readOnly']
        });
    }

    _raiseOpenAction() {
        if(!this._openAction) {
            this._createOpenAction();
        }
        this._openAction();
    }

    _createCloseAction() {
        this._closeAction = this._createActionByOption('onClosed', {
            excludeValidators: ['disabled', 'readOnly']
        });
    }

    _raiseCloseAction() {
        if(!this._closeAction) {
            this._createCloseAction();
        }
        this._closeAction();
    }

    _createValueChangeAction() {
        this._valueChangeAction = this._createActionByOption('onValueChanged', {
            excludeValidators: ['disabled', 'readOnly']
        });
    }

    _createEventAction(eventName) {
        this[`_${camelize(eventName)}Action`] = this._createActionByOption(`on${eventName}`, {
            excludeValidators: ['readOnly']
        });
    }

    _raiseAction(eventName, event) {
        const action = this[`_${camelize(eventName)}Action`];
        if(!action) {
            this._createEventAction(eventName);
        }
        this[`_${camelize(eventName)}Action`]({ event });
    }

    _raiseValueChangeAction(value, previousValue) {
        if(!this._valueChangeAction) {
            this._createValueChangeAction();
        }
        this._valueChangeAction(this._valueChangeArgs(value, previousValue));
    }

    _valueChangeArgs(value, previousValue) {
        return {
            value: value,
            previousValue: previousValue,
            event: this._valueChangeEventInstance
        };
    }

    _saveValueChangeEvent(e) {
        this._valueChangeEventInstance = e;
    }

    _initTemplates() {
        this._templateManager.addDefaultTemplates({
            dropDownButton: new FunctionTemplate(function(options) {
                const $icon = $('<div>').addClass(DROP_DOWN_EDITOR_BUTTON_ICON);
                $(options.container).append($icon);
            })
        });
        this.callBase();
    }

    _getDefaultButtons() {
        return [
            { name: 'clear', Ctor: ClearButton },
            { name: 'dropDown', Ctor: DropDownButton }
        ];
    }

    _initMarkup() {
        this.$element()
            .addClass(DATERANGEBOX_CLASS)
            // TODO: remove next classes after adding styles
            .addClass('dx-texteditor')
            .addClass('dx-datebox-date')
            .addClass('dx-dropdowneditor');

        this._toggleReadOnlyState();
        this._renderStylingMode();
        // TODO: probably it need to update styling mode for dropDown in buttons container. It depends from design decision

        this._renderStartDateBox();
        this._renderSeparator();
        this._renderEndDateBox();

        this._renderButtonsContainer();

        super._initMarkup();
    }

    _attachKeyboardEvents() {
        if(!this.option('readOnly')) {
            super._attachKeyboardEvents();
        }
    }

    _toggleReadOnlyState() {
        const { readOnly } = this.option();

        this.$element().toggleClass(READONLY_STATE_CLASS, !!readOnly);
        // TODO: should we add area readonly here?
    }

    _getStylingModePrefix() {
        return `${DATERANGEBOX_CLASS}-`;
    }

    // TODO: extract this part from Editor to separate file and use it here
    _renderStylingMode() {
        const optionName = 'stylingMode';
        const optionValue = this.option(optionName);
        const prefix = this._getStylingModePrefix();

        const allowedStylingClasses = ALLOWED_STYLING_MODES.map((mode) => {
            return prefix + mode;
        });

        allowedStylingClasses.forEach(className => this.$element().removeClass(className));

        let stylingModeClass = prefix + optionValue;

        if(allowedStylingClasses.indexOf(stylingModeClass) === -1) {
            const defaultOptionValue = this._getDefaultOptions()[optionName];
            const platformOptionValue = this._convertRulesToOptions(this._defaultOptionsRules())[optionName];
            stylingModeClass = prefix + (platformOptionValue || defaultOptionValue);
        }

        this.$element().addClass(stylingModeClass);
    }

    _renderStartDateBox() {
        this._$startDateBox = $('<div>')
            .addClass(START_DATEBOX_CLASS)
            .appendTo(this.$element());

        this._startDateBox = this._createComponent(this._$startDateBox, MultiselectDateBox, this._getStartDateBoxConfig());
    }

    _renderEndDateBox() {
        this._$endDateBox = $('<div>')
            .addClass(END_DATEBOX_CLASS)
            .appendTo(this.$element());

        this._endDateBox = this._createComponent(this._$endDateBox, MultiselectDateBox, this._getEndDateBoxConfig());
    }

    _renderSeparator() {
        // TODO: request design for rtl mode and research rtl mode appearance
        // TODO: add transform: scale(-1, 1) for mirror of the icon in rtl mode
        const $icon = getImageContainer(SEPARATOR_ICON_NAME);
        this._$separator = $('<div>')
            .addClass(DATERANGEBOX_SEPARATOR_CLASS)
            .appendTo(this.$element());

        $icon.appendTo(this._$separator);
    }

    _renderButtonsContainer() {
        this._buttonCollection = new TextEditorButtonCollection(this, this._getDefaultButtons());

        this._$beforeButtonsContainer = null;
        this._$afterButtonsContainer = null;

        const { buttons } = this.option();

        this._$beforeButtonsContainer = this._buttonCollection.renderBeforeButtons(buttons, this.$element());
        this._$afterButtonsContainer = this._buttonCollection.renderAfterButtons(buttons, this.$element());
    }

    _updateButtons(names) {
        this._buttonCollection.updateButtons(names);
    }

    _openHandler() {
        this._toggleOpenState();
    }

    _shouldCallOpenHandler() {
        return true;
    }

    _toggleOpenState() {
        this.getStartDateBox().focus();

        this.option('opened', !this.option('opened'));
    }

    _clearValueHandler(e) {
        this.getEndDateBox()._clearValueHandler(e);
        this.getStartDateBox()._clearValueHandler(e);
    }

    _isClearButtonVisible() {
        return this.option('showClearButton') && !this.option('readOnly');
    }

    _focusInHandler(e) {
        super._focusInHandler(e);
    }

    _getDateBoxConfig() {
        const options = this.option();

        const dateBoxConfig = {
            // TODO: pass type option clearly
            acceptCustomValue: options.acceptCustomValue,
            activeStateEnabled: options.activeStateEnabled,
            applyValueMode: options.applyValueMode,
            dateOutOfRangeMessage: options.dateOutOfRangeMessage,
            dateSerializationFormat: options.dateSerializationFormat,
            deferRendering: options.deferRendering,
            displayFormat: options.displayFormat,
            focusStateEnabled: options.focusStateEnabled,
            tabIndex: options.tabIndex,
            height: options.height,
            hoverStateEnabled: options.hoverStateEnabled,
            invalidDateMessage: options.invalidDateMessage,
            isValid: options.isValid,
            labelMode: options.labelMode,
            max: options.max,
            maxLength: options.maxLength,
            min: options.min,
            openOnFieldClick: options.openOnFieldClick,
            pickerType: 'calendar',
            readOnly: options.readOnly,
            disabled: options.disabled,
            rtlEnabled: options.rtlEnabled,
            spellcheck: options.spellcheck,
            stylingMode: 'underlined',
            useMaskBehavior: options.useMaskBehavior,
            validationMessageMode: options.validationMessageMode,
            validationMessagePosition: options.validationMessagePosition,
            validationStatus: options.validationStatus,
            valueChangeEvent: options.valueChangeEvent,
            onKeyDown: options.onKeyUp,
            onKeyUp: options.onKeyUp,
            onChange: options.onChange,
            onInput: options.onInput,
            onCut: options.onCut,
            onCopy: options.onCopy,
            onPaste: options.onPaste,
            onEnterKey: options.onEnterKey,
            _dateRangeBoxInstance: this,
        };

        each(EVENTS_LIST, (_, eventName) => {
            const optionName = `on${eventName}`;

            if(this.hasActionSubscription(optionName)) {
                dateBoxConfig[optionName] = (e) => {
                    this._raiseAction(eventName, e.event);
                };
            }
        });

        return dateBoxConfig;
    }

    _getStartDateBoxConfig() {
        // NOTE: delete part of options if we deside to use new Popup
        const options = this.option();

        return {
            ...this._getDateBoxConfig(),
            applyButtonText: options.applyButtonText,
            calendarOptions: options.calendarOptions,
            cancelButtonText: options.cancelButtonText,
            deferRendering: options.deferRendering,
            disabledDates: options.disabledDates,
            dropDownOptions: options.dropDownOptions,
            onValueChanged: ({ value }) => {
                const newValue = [value, this.option('value')[1]];
                this.updateValue(newValue);
            },
            opened: options.opened,
            onOpened: () => {
                this.option('opened', true);

                this._raiseOpenAction();
            },
            onClosed: () => {
                this.option('opened', false);

                this._raiseCloseAction();
            },
            todayButtonText: options.todayButtonText,
            showClearButton: false,
            showDropDownButton: false,
            value: this.option('value')[0],
            label: options.startDateLabel,
            placeholder: options.startDatePlaceholder,
        };
    }

    _getEndDateBoxConfig() {
        const options = this.option();

        return {
            ...this._getDateBoxConfig(),
            dropDownOptions: {
                onShowing: (e) => {
                    e.cancel = true;
                    this.getStartDateBox().focus();
                    this.getStartDateBox().open();

                    // TODO: datebox doesn't clear opened state after prevent of opening
                    this.getEndDateBox().option('opened', false);
                }
            },
            onValueChanged: ({ value }) => {
                const newValue = [this.option('value')[0], value];
                this.updateValue(newValue);
            },
            showClearButton: false,
            showDropDownButton: false,
            value: this.option('value')[1],
            label: options.endDateLabel,
            placeholder: options.endDatePlaceholder,
            deferRendering: true,
        };
    }

    updateValue(newValue) {
        if(!isSameDateArrays(newValue, this.option('value'))) {
            this.option('value', newValue);
        }
    }

    _updateDateBoxesValue(newValue) {
        const startDateBox = this.getStartDateBox();
        const endDateBox = this.getEndDateBox();
        const [newStartDate, newEndDate] = newValue;
        const oldStartDate = startDateBox.option('value');
        const oldEndDate = endDateBox.option('value');

        if(!isSameDates(newStartDate, oldStartDate)) {
            startDateBox.option('value', newStartDate);
        }

        if(!isSameDates(newEndDate, oldEndDate)) {
            endDateBox.option('value', newEndDate);
        }
    }

    _renderAccessKey() {
        const $startDateInput = $(this.field()[0]);
        const { accessKey } = this.option();

        $startDateInput.attr('accesskey', accessKey);
    }

    _focusTarget() {
        return this.$element().find(`.${TEXTEDITOR_INPUT_CLASS}`);
    }

    _focusEventTarget() {
        return this.element();
    }

    _focusClassTarget() {
        return this.$element();
    }

    _toggleFocusClass(isFocused, $element) {
        super._toggleFocusClass(isFocused, this._focusClassTarget($element));
    }

    _cleanButtonContainers() {
        this._$beforeButtonsContainer?.remove();
        this._$afterButtonsContainer?.remove();
        this._buttonCollection.clean();
        this._$beforeButtonsContainer = null;
        this._$afterButtonsContainer = null;
    }

    _clean() {
        this._cleanButtonContainers();

        this._$startDateBox?.remove();
        this._$endDateBox?.remove();
        this._$separator?.remove();

        super._clean();
    }

    _optionChanged(args) {
        const { name, value, previousValue } = args;

        switch(name) {
            case 'acceptCustomValue':
            case 'applyButtonText':
            case 'applyValueMode':
                break;
            case 'buttons':
                this._cleanButtonContainers();
                this._renderButtonsContainer();
                break;
            case 'dateSerializationFormat':
            case 'max':
            case 'min':
            case 'spellcheck':
            case 'useMaskBehavior':
            case 'valueChangeEvent':
                this.getStartDateBox().option(name, value);
                this.getEndDateBox().option(name, value);
                break;
            case 'calendarOptions':
            case 'cancelButtonText':
            case 'dateOutOfRangeMessage':
            case 'disabledDates':
            case 'displayFormat':
                break;
            case 'height':
                this.getStartDateBox().option(name, value);
                this.getEndDateBox().option(name, value);
                super._optionChanged(args);
                break;
            case 'dropDownButtonTemplate':
            case 'showDropDownButton':
                this._updateButtons(['dropDown']);
                break;
            case 'showClearButton':
                this._updateButtons(['clear']);
                break;
            case 'endDate':
            case 'invalidDateMessage':
            case 'isValid':
                break;
            case 'startDateLabel':
                this.getStartDateBox().option('label', value);
                break;
            case 'endDateLabel':
                this.getEndDateBox().option('label', value);
                break;
            case 'startDatePlaceholder':
                this.getStartDateBox().option('placeholder', value);
                break;
            case 'endDatePlaceholder':
                this.getEndDateBox().option('placeholder', value);
                break;
            case 'labelMode':
                break;
            case 'tabIndex':
            case 'focusStateEnabled':
                super._optionChanged(args);

                this.getStartDateBox().option(name, value);
                this.getEndDateBox().option(name, value);
                break;
            case 'maxLength':
                break;
            case 'onValueChanged':
                this._createValueChangeAction();
                break;
            case 'opened':
            case 'deferRendering':
            case 'dropDownOptions':
                this.getStartDateBox().option(name, value);
                break;
            case 'onOpened':
            case 'onClosed':
            case 'onKeyDown':
            case 'onKeyUp':
            case 'onChange':
            case 'onInput':
            case 'onCut':
            case 'onCopy':
            case 'onPaste':
            case 'onEnterKey':
                break;
            case 'openOnFieldClick':
                break;
            case 'readOnly':
                this._updateButtons();

                this._toggleReadOnlyState();
                this._refreshFocusState();

                this.getStartDateBox().option(name, value);
                this.getEndDateBox().option(name, value);
                break;
            case 'disabled':
                // TODO: understand the scenario where it needs and add test
                this._updateButtons();

                super._optionChanged(args);

                this.getStartDateBox().option(name, value);
                this.getEndDateBox().option(name, value);
                break;
            case 'startDate':
                break;
            case 'stylingMode':
                this._renderStylingMode();
                break;
            case 'text':
            case 'todayButtonText':
            case 'useHiddenSubmitElement':
            case 'validationError':
            case 'validationErrors':
            case 'validationMessageMode':
            case 'validationMessagePosition':
            case 'validationStatus':
                break;
            case 'value':
                this._raiseValueChangeAction(value, previousValue);
                this._saveValueChangeEvent(undefined);
                this._updateDateBoxesValue(value);
                break;
            default:
                super._optionChanged(args);
        }
    }

    getStartDateBox() {
        return this._startDateBox;
    }

    getEndDateBox() {
        return this._endDateBox;
    }

    getButton(name) {
        return this._buttonCollection.getButton(name);
    }

    open() {
        this.option('opened', true);
    }

    close() {
        this.option('opened', false);
    }

    content() {
        return this.getStartDateBox().content();
    }

    field() {
        return [this.getStartDateBox().field(), this.getEndDateBox().field()];
    }

    reset() {
        // TODO: add test
        this.getEndDateBox().reset();
        this.getStartDateBox().reset();
    }
}

registerComponent('dxDateRangeBox', DateRangeBox);

export default DateRangeBox;
