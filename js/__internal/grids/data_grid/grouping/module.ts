/* eslint-disable @typescript-eslint/method-signature-style */
import { registerKeyboardAction } from '@js/ui/grid_core/ui.grid_core.accessibility';
import { getHeight } from '@js/core/utils/size';
import $ from '@js/core/renderer';
import messageLocalization from '@js/localization/message';
import { isDefined, isString } from '@js/core/utils/type';
import { each } from '@js/core/utils/iterator';
import devices from '@js/core/devices';
import { when, Deferred } from '@js/core/utils/deferred';
import { setTabIndex, restoreFocus } from '@js/ui/shared/accessibility';
import dataSourceAdapter from '../module_data_source_adapter';
import { GroupingHelper as CollapsedGroupingHelper } from './module_collapsed';
import { GroupingHelper as ExpandedGroupingHelper } from './module_expanded';
import gridCore from '../module_core';

const DATAGRID_GROUP_PANEL_CLASS = 'dx-datagrid-group-panel';
const DATAGRID_GROUP_PANEL_MESSAGE_CLASS = 'dx-group-panel-message';
const DATAGRID_GROUP_PANEL_ITEM_CLASS = 'dx-group-panel-item';
const DATAGRID_GROUP_PANEL_LABEL_CLASS = 'dx-toolbar-label';
const DATAGRID_GROUP_PANEL_CONTAINER_CLASS = 'dx-toolbar-item';
const DATAGRID_EXPAND_CLASS = 'dx-datagrid-expand';
const DATAGRID_GROUP_ROW_CLASS = 'dx-group-row';
const HEADER_FILTER_CLASS_SELECTOR = '.dx-header-filter';

export interface GroupingDataControllerExtension {
  isRowExpanded(key): boolean;
  changeRowExpand(key, isRowClick?): any;
}

const GroupingDataSourceAdapterExtender = (function () {
  return {
    init() {
      this.callBase.apply(this, arguments);
      this._initGroupingHelper();
    },
    _initGroupingHelper(options) {
      const grouping = this._grouping;
      const isAutoExpandAll = this.option('grouping.autoExpandAll');
      const isFocusedRowEnabled = this.option('focusedRowEnabled');
      const remoteOperations = options ? options.remoteOperations : this.remoteOperations();
      const isODataRemoteOperations = remoteOperations.filtering && remoteOperations.sorting && remoteOperations.paging;

      if (isODataRemoteOperations && !remoteOperations.grouping && (isAutoExpandAll || !isFocusedRowEnabled)) {
        if (!grouping || grouping instanceof CollapsedGroupingHelper) {
          this._grouping = new ExpandedGroupingHelper(this);
        }
      } else if (!grouping || grouping instanceof ExpandedGroupingHelper) {
        this._grouping = new CollapsedGroupingHelper(this);
      }
    },
    totalItemsCount() {
      const that = this;
      const totalCount = that.callBase();

      return totalCount > 0 && that._dataSource.group() && that._dataSource.requireTotalCount() ? totalCount + that._grouping.totalCountCorrection() : totalCount;
    },
    itemsCount() {
      return this._dataSource.group() ? this._grouping.itemsCount() || 0 : this.callBase.apply(this, arguments);
    },
    allowCollapseAll() {
      return this._grouping.allowCollapseAll();
    },
    isGroupItemCountable(item) {
      return this._grouping.isGroupItemCountable(item);
    },
    isRowExpanded(key) {
      const groupInfo = this._grouping.findGroupInfo(key);
      return groupInfo ? groupInfo.isExpanded : !this._grouping.allowCollapseAll();
    },
    collapseAll(groupIndex) {
      return this._collapseExpandAll(groupIndex, false);
    },
    expandAll(groupIndex) {
      return this._collapseExpandAll(groupIndex, true);
    },
    _collapseExpandAll(groupIndex, isExpand) {
      const that = this;
      const dataSource = that._dataSource;
      const group = dataSource.group();
      const groups = gridCore.normalizeSortingInfo(group || []);

      if (groups.length) {
        for (let i = 0; i < groups.length; i++) {
          if (groupIndex === undefined || groupIndex === i) {
            groups[i].isExpanded = isExpand;
          } else if (group && group[i]) {
            groups[i].isExpanded = group[i].isExpanded;
          }
        }
        dataSource.group(groups);
        that._grouping.foreachGroups((groupInfo, parents) => {
          if (groupIndex === undefined || groupIndex === parents.length - 1) {
            groupInfo.isExpanded = isExpand;
          }
        }, false, true);

        that.resetPagesCache();
      }
      return true;
    },
    refresh() {
      this.callBase.apply(this, arguments);

      return this._grouping.refresh.apply(this._grouping, arguments);
    },
    changeRowExpand(path) {
      const that = this;
      const dataSource = that._dataSource;

      if (dataSource.group()) {
        dataSource.beginLoading();
        if (that._lastLoadOptions) {
          that._lastLoadOptions.groupExpand = true;
        }
        return that._changeRowExpandCore(path).always(() => {
          dataSource.endLoading();
        });
      }
    },
    _changeRowExpandCore(path) {
      return this._grouping.changeRowExpand(path);
    },
    /// #DEBUG
    getGroupsInfo() {
      return this._grouping._groupsInfo;
    },
    /// #ENDDEBUG
    // @ts-expect-error
    _hasGroupLevelsExpandState(group, isExpanded) {
      if (group && Array.isArray(group)) {
        for (let i = 0; i < group.length; i++) {
          if (group[i].isExpanded === isExpanded) {
            return true;
          }
        }
      }
    },
    _customizeRemoteOperations(options, operationTypes) {
      const { remoteOperations } = options;

      if (options.storeLoadOptions.group) {
        if (remoteOperations.grouping && !options.isCustomLoading) {
          if (!remoteOperations.groupPaging || this._hasGroupLevelsExpandState(options.storeLoadOptions.group, true)) {
            remoteOperations.paging = false;
          }
        }

        if (!remoteOperations.grouping && (!remoteOperations.sorting || !remoteOperations.filtering || options.isCustomLoading || this._hasGroupLevelsExpandState(options.storeLoadOptions.group, false))) {
          remoteOperations.paging = false;
        }
      } else if (!options.isCustomLoading && remoteOperations.paging && operationTypes.grouping) {
        this.resetCache();
      }

      this.callBase.apply(this, arguments);
    },
    _handleDataLoading(options) {
      this.callBase(options);
      this._initGroupingHelper(options);
      return this._grouping.handleDataLoading(options);
    },
    _handleDataLoaded(options) {
      return this._grouping.handleDataLoaded(options, this.callBase.bind(this));
    },
    _handleDataLoadedCore(options) {
      return this._grouping.handleDataLoadedCore(options, this.callBase.bind(this));
    },
  };
}());

dataSourceAdapter.extend(GroupingDataSourceAdapterExtender);

const GroupingDataControllerExtender = (function () {
  return {
    init() {
      const that = this;
      that.callBase();

      that.createAction('onRowExpanding');
      that.createAction('onRowExpanded');
      that.createAction('onRowCollapsing');
      that.createAction('onRowCollapsed');
    },
    _beforeProcessItems(items) {
      const groupColumns = this._columnsController.getGroupColumns();

      items = this.callBase(items);
      if (items.length && groupColumns.length) {
        items = this._processGroupItems(items, groupColumns.length);
      }
      return items;
    },
    _processItem(item, options) {
      if (isDefined(item.groupIndex) && isString(item.rowType) && item.rowType.indexOf('group') === 0) {
        item = this._processGroupItem(item, options);
        options.dataIndex = 0;
      } else {
        item = this.callBase.apply(this, arguments);
      }
      return item;
    },
    _processGroupItem(item) {
      return item;
    },
    _processGroupItems(items, groupsCount, options) {
      const that = this;
      const groupedColumns = that._columnsController.getGroupColumns();
      const column = groupedColumns[groupedColumns.length - groupsCount];

      if (!options) {
        const scrollingMode = that.option('scrolling.mode');
        options = {
          collectContinuationItems: scrollingMode !== 'virtual' && scrollingMode !== 'infinite',
          resultItems: [],
          path: [],
          values: [],
        };
      }

      const { resultItems } = options;

      if (options.data) {
        if (options.collectContinuationItems || !options.data.isContinuation) {
          resultItems.push({
            rowType: 'group',
            data: options.data,
            groupIndex: options.path.length - 1,
            isExpanded: !!options.data.items,
            key: options.path.slice(0),
            values: options.values.slice(0),
          });
        }
      }
      if (items) {
        if (groupsCount === 0) {
          resultItems.push.apply(resultItems, items);
        } else {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item && 'items' in item) {
              options.data = item;
              options.path.push(item.key);
              options.values.push(column && column.deserializeValue && !column.calculateDisplayValue ? column.deserializeValue(item.key) : item.key);
              that._processGroupItems(item.items, groupsCount - 1, options);
              options.data = undefined;
              options.path.pop();
              options.values.pop();
            } else {
              resultItems.push(item);
            }
          }
        }
      }

      return resultItems;
    },
    publicMethods() {
      return this.callBase().concat(['collapseAll', 'expandAll', 'isRowExpanded', 'expandRow', 'collapseRow']);
    },
    collapseAll(groupIndex) {
      const dataSource = this._dataSource;
      if (dataSource && dataSource.collapseAll(groupIndex)) {
        dataSource.pageIndex(0);
        dataSource.reload();
      }
    },
    expandAll(groupIndex) {
      const dataSource = this._dataSource;
      if (dataSource && dataSource.expandAll(groupIndex)) {
        dataSource.pageIndex(0);
        dataSource.reload();
      }
    },
    changeRowExpand(key) {
      const that = this;
      const expanded = that.isRowExpanded(key);
      const args: any = {
        key,
        expanded,
      };

      that.executeAction(expanded ? 'onRowCollapsing' : 'onRowExpanding', args);

      if (!args.cancel) {
        return when(that._changeRowExpandCore(key)).done(() => {
          args.expanded = !expanded;
          that.executeAction(expanded ? 'onRowCollapsed' : 'onRowExpanded', args);
        });
      }

      // @ts-expect-error
      return new Deferred().resolve();
    },
    _changeRowExpandCore(key) {
      const that = this;
      const dataSource = this._dataSource;

      // @ts-expect-error
      const d = new Deferred();
      if (!dataSource) {
        d.resolve();
      } else {
        when(dataSource.changeRowExpand(key)).done(() => {
          that.load().done(d.resolve).fail(d.reject);
        }).fail(d.reject);
      }
      return d;
    },
    isRowExpanded(key) {
      const dataSource = this._dataSource;

      return dataSource && dataSource.isRowExpanded(key);
    },
    expandRow(key) {
      if (!this.isRowExpanded(key)) {
        return this.changeRowExpand(key);
      }
      // @ts-expect-error
      return new Deferred().resolve();
    },
    collapseRow(key) {
      if (this.isRowExpanded(key)) {
        return this.changeRowExpand(key);
      }
      // @ts-expect-error
      return new Deferred().resolve();
    },
    optionChanged(args) {
      if (args.name === 'grouping'/* autoExpandAll */) {
        args.name = 'dataSource';
      }
      this.callBase(args);
    },
  };
}());

const onGroupingMenuItemClick = function (column, params) {
  const columnsController = this._columnsController;

  // eslint-disable-next-line default-case
  switch (params.itemData.value) {
    case 'group': {
      const groups = columnsController._dataSource.group() || [];

      columnsController.columnOption(column.dataField, 'groupIndex', groups.length);
      break;
    }
    case 'ungroup':
      columnsController.columnOption(column.dataField, 'groupIndex', -1);
      break;
    case 'ungroupAll':
      this.component.clearGrouping();
      break;
  }
};

const isGroupPanelVisible = (groupPanelOptions): boolean => {
  const visible = groupPanelOptions?.visible;

  return visible === 'auto'
    ? devices.current().deviceType === 'desktop'
    : !!visible;
};

const allowDragging = (groupPanelOptions, column): boolean => {
  const isVisible = isGroupPanelVisible(groupPanelOptions);
  const canDrag = groupPanelOptions?.allowColumnDragging && column.allowGrouping;

  return isVisible && !!canDrag;
};

export const GroupingHeaderPanelExtender = (function () {
  return {
    _getToolbarItems() {
      const items = this.callBase();

      return this._appendGroupingItem(items);
    },

    _appendGroupingItem(items) {
      if (this._isGroupPanelVisible()) {
        let isRendered = false;
        const toolbarItem = {
          template: () => {
            const $groupPanel = $('<div>').addClass(DATAGRID_GROUP_PANEL_CLASS);
            this._updateGroupPanelContent($groupPanel);
            registerKeyboardAction('groupPanel', this, $groupPanel, undefined, this._handleActionKeyDown.bind(this));
            return $groupPanel;
          },
          name: 'groupPanel',
          onItemRendered: () => {
            isRendered && this.renderCompleted.fire();
            isRendered = true;
          },
          location: 'before',
          locateInMenu: 'never',
          sortIndex: 1,
        };

        items.push(toolbarItem);
        this.updateToolbarDimensions();
      }

      return items;
    },

    _handleActionKeyDown(args) {
      const { event } = args;
      const $target = $(event.target);
      const groupColumnIndex = $target.closest(`.${DATAGRID_GROUP_PANEL_ITEM_CLASS}`).index();
      const column = this._columnsController.getGroupColumns()[groupColumnIndex];
      const columnIndex = column && column.index;

      if ($target.is(HEADER_FILTER_CLASS_SELECTOR)) {
        this.getController('headerFilter').showHeaderFilterMenu(columnIndex, true);
      } else {
        this._processGroupItemAction(columnIndex);
      }

      event.preventDefault();
    },

    _isGroupPanelVisible(): boolean {
      return isGroupPanelVisible(this.option('groupPanel'));
    },

    _renderGroupPanelItems($groupPanel, groupColumns) {
      const that = this;

      $groupPanel.empty();

      each(groupColumns, (index, groupColumn) => {
        that._createGroupPanelItem($groupPanel, groupColumn);
      });

      restoreFocus(this);
    },

    _createGroupPanelItem($rootElement, groupColumn) {
      const $groupPanelItem = $('<div>')
        .addClass(groupColumn.cssClass)
        .addClass(DATAGRID_GROUP_PANEL_ITEM_CLASS)
        .data('columnData', groupColumn)
        .appendTo($rootElement)
        .text(groupColumn.caption);

      setTabIndex(this, $groupPanelItem);

      return $groupPanelItem;
    },

    _columnOptionChanged(e) {
      if (!this._requireReady && !gridCore.checkChanges(e.optionNames, ['width', 'visibleWidth'])) {
        const $toolbarElement = this.element();
        const $groupPanel = $toolbarElement && $toolbarElement.find(`.${DATAGRID_GROUP_PANEL_CLASS}`);

        if ($groupPanel && $groupPanel.length) {
          this._updateGroupPanelContent($groupPanel);
          this.updateToolbarDimensions();
          this.renderCompleted.fire();
        }
      }
      this.callBase();
    },

    _updateGroupPanelContent($groupPanel) {
      const that = this;
      const groupColumns = that.getController('columns').getGroupColumns();
      const groupPanelOptions = that.option('groupPanel');

      that._renderGroupPanelItems($groupPanel, groupColumns);

      if (groupPanelOptions.allowColumnDragging && !groupColumns.length) {
        $('<div>')
          .addClass(DATAGRID_GROUP_PANEL_MESSAGE_CLASS)
          .text(groupPanelOptions.emptyPanelText)
          .appendTo($groupPanel);

        $groupPanel.closest(`.${DATAGRID_GROUP_PANEL_CONTAINER_CLASS}`).addClass(DATAGRID_GROUP_PANEL_LABEL_CLASS);
        $groupPanel.closest(`.${DATAGRID_GROUP_PANEL_LABEL_CLASS}`).css('maxWidth', 'none');
      }
    },

    allowDragging(column): boolean {
      const groupPanelOptions = this.option('groupPanel');

      return allowDragging(groupPanelOptions, column);
    },

    getColumnElements() {
      const $element = this.element();
      return $element && $element.find(`.${DATAGRID_GROUP_PANEL_ITEM_CLASS}`);
    },

    getColumns() {
      return this.getController('columns').getGroupColumns();
    },

    getBoundingRect() {
      const that = this;
      const $element = that.element();

      if ($element && $element.find(`.${DATAGRID_GROUP_PANEL_CLASS}`).length) {
        const offset = $element.offset();

        return {
          top: offset.top,
          bottom: offset.top + getHeight($element),
        };
      }
      return null;
    },

    getName() {
      return 'group';
    },

    getContextMenuItems(options) {
      const that = this;
      const contextMenuEnabled = that.option('grouping.contextMenuEnabled');
      const $groupedColumnElement = $(options.targetElement).closest(`.${DATAGRID_GROUP_PANEL_ITEM_CLASS}`);
      let items;

      if ($groupedColumnElement.length) {
        options.column = $groupedColumnElement.data('columnData');
      }

      if (contextMenuEnabled && options.column) {
        const { column } = options;
        const isGroupingAllowed = isDefined(column.allowGrouping) ? column.allowGrouping : true;

        if (isGroupingAllowed) {
          const isColumnGrouped = isDefined(column.groupIndex) && column.groupIndex > -1;
          const groupingTexts = that.option('grouping.texts');
          const onItemClick = onGroupingMenuItemClick.bind(that, column);

          items = [
            {
              text: groupingTexts.ungroup, value: 'ungroup', disabled: !isColumnGrouped, onItemClick,
            },
            { text: groupingTexts.ungroupAll, value: 'ungroupAll', onItemClick },
          ];
        }
      }
      return items;
    },

    isVisible() {
      return this.callBase() || this._isGroupPanelVisible();
    },

    hasGroupedColumns(): boolean {
      return this._isGroupPanelVisible() && !!this.getColumns().length;
    },

    optionChanged(args) {
      if (args.name === 'groupPanel') {
        this._invalidate();
        args.handled = true;
      } else {
        this.callBase(args);
      }
    },
  };
}());

const GroupingRowsViewExtender = (function () {
  return {
    getContextMenuItems(options) {
      const that = this;
      const contextMenuEnabled = that.option('grouping.contextMenuEnabled');
      let items;

      if (contextMenuEnabled && options.row && options.row.rowType === 'group') {
        const columnsController = that._columnsController;
        const column = columnsController.columnOption(`groupIndex:${options.row.groupIndex}`);

        if (column && column.allowGrouping) {
          const groupingTexts = that.option('grouping.texts');
          const onItemClick = onGroupingMenuItemClick.bind(that, column);

          items = [];

          items.push(
            { text: groupingTexts.ungroup, value: 'ungroup', onItemClick },
            { text: groupingTexts.ungroupAll, value: 'ungroupAll', onItemClick },
          );
        }
      }
      return items;
    },

    _rowClick(e) {
      const that = this;
      const expandMode = that.option('grouping.expandMode');
      const scrollingMode = that.option('scrolling.mode');
      const isGroupRowStateChanged = scrollingMode !== 'infinite' && expandMode === 'rowClick' && $(e.event.target).closest(`.${DATAGRID_GROUP_ROW_CLASS}`).length;
      const isExpandButtonClicked = $(e.event.target).closest(`.${DATAGRID_EXPAND_CLASS}`).length;

      if (isGroupRowStateChanged || isExpandButtonClicked) {
        that._changeGroupRowState(e);
      }

      that.callBase(e);
    },

    _changeGroupRowState(e) {
      const dataController = this.getController('data');
      const row = dataController.items()[e.rowIndex];
      const allowCollapsing = this._columnsController.columnOption(`groupIndex:${row.groupIndex}`, 'allowCollapsing');

      if (row.rowType === 'data' || row.rowType === 'group' && allowCollapsing !== false) {
        dataController.changeRowExpand(row.key, true);
        e.event.preventDefault();
        e.handled = true;
      }
    },
  };
}());

const columnHeadersViewExtender = (function () {
  return {
    getContextMenuItems(options) {
      const that = this;
      const contextMenuEnabled = that.option('grouping.contextMenuEnabled');
      let items = that.callBase(options);

      if (contextMenuEnabled && options.row && (options.row.rowType === 'header' || options.row.rowType === 'detailAdaptive')) {
        const { column } = options;

        if (!column.command && (!isDefined(column.allowGrouping) || column.allowGrouping)) {
          const groupingTexts = that.option('grouping.texts');
          const isColumnGrouped = isDefined(column.groupIndex) && column.groupIndex > -1;
          const onItemClick = onGroupingMenuItemClick.bind(that, column);

          items = items || [];
          items.push({
            text: groupingTexts.groupByThisColumn, value: 'group', beginGroup: true, disabled: isColumnGrouped, onItemClick,
          });

          if (column.showWhenGrouped) {
            items.push({
              text: groupingTexts.ungroup, value: 'ungroup', disabled: !isColumnGrouped, onItemClick,
            });
          }

          items.push({ text: groupingTexts.ungroupAll, value: 'ungroupAll', onItemClick });
        }
      }
      return items;
    },

    allowDragging(column): boolean {
      const groupPanelOptions = this.option('groupPanel');

      return allowDragging(groupPanelOptions, column) || this.callBase(column);
    },
  };
}());
gridCore.registerModule('grouping', {
  defaultOptions() {
    return {
      grouping: {
        autoExpandAll: true,
        allowCollapsing: true,
        contextMenuEnabled: false,
        expandMode: 'buttonClick',
        texts: {
          groupContinuesMessage: messageLocalization.format('dxDataGrid-groupContinuesMessage'),
          groupContinuedMessage: messageLocalization.format('dxDataGrid-groupContinuedMessage'),
          groupByThisColumn: messageLocalization.format('dxDataGrid-groupHeaderText'),
          ungroup: messageLocalization.format('dxDataGrid-ungroupHeaderText'),
          ungroupAll: messageLocalization.format('dxDataGrid-ungroupAllText'),
        },
      },
      groupPanel: {
        visible: false,
        emptyPanelText: messageLocalization.format('dxDataGrid-groupPanelEmptyText'),
        allowColumnDragging: true,
      },
    };
  },
  extenders: {
    controllers: {
      data: GroupingDataControllerExtender,
      columns: {
        _getExpandColumnOptions() {
          const options = this.callBase.apply(this, arguments);

          options.cellTemplate = gridCore.getExpandCellTemplate();

          return options;
        },
      },
      editing: {
        _isProcessedItem(item) {
          return isDefined(item.groupIndex) && isString(item.rowType) && item.rowType.indexOf('group') === 0;
        },
      },
    },
    views: {
      headerPanel: GroupingHeaderPanelExtender,
      rowsView: GroupingRowsViewExtender,
      columnHeadersView: columnHeadersViewExtender,
    },
  },
});
