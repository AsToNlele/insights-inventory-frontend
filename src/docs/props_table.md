- [Props](#props)
  - [getEntities](#getentities)
  - [hideFilters](#hidefilters)
  - [columns](#columns)
    - [columns as function](#columns-as-function)
  - [disableDefaultColumns](#disabledefaultcolumns)
  - [ref](#ref)
  - [onLoad](#onload)
  - [showTags](#showtags)
  - [customFilters](#customfilters)
  - [hasCheckbox](#hascheckbox)
  - [isFullView](#isfullview)
  - [onRefresh](#onrefresh)
  - [tableProps](#tableprops)
  - [paginationProps](#paginationprops)
  - [autoRefresh](#autorefresh)
  - [initialLoading](#initialloading)
  - [ignoreRefresh](#ignorerefresh)
  - [showTagModal](#showtagmodal)
  - [fetchCustomOSes](#fetchCustomOSes)

# Props

## getEntities

*function*

A function allowing to replace default fetch function, so each application can load its specific data.

[Read more.](./custom_fetch.md)

## hideFilters

*object*

An object allowing to hide default filters.

[Read more.](./hide_filters.md)

## columns

*array | (defaultColumns) => array*

An array of columns definitions. They are merged with default columns by their keys.

### columns as function

You can use a function as `columns` prop. This function receives the default columns array as the first attribute, so you can do any modification you need.

**note: this function is called only 1x to keep a good performance. If you need to call it after the initial render (for example, some outside variable is changing the results) change `columnsCounter`<number> prop.**

## disableDefaultColumns

*boolean | string[]*

You can disable default columns. If you set this prop to `true`, then all the default columns are disabled. Or you can provide an array of keys to disable just specific ones: `[ 'display_name', 'last_seen' ]`. **This prop is working only with `columns` prop!** If you are changing columns via reducer, nothing changes. But you should consider migrating your application to use the prop.

## ref

*ref*

## onLoad

*function*

## showTags

*boolean*

## customFilters

*object*

You can pass consumer application specific filters to the InventoryTable using `customFilters`. Whenever those passed filters get changed, the Inventory table fires onRefresh function and reloads. This prop also allows you to pass default values for shared filters e.g OS, tag and stale filters

## hasCheckbox

*boolean*

## isFullView

*boolean*

## onRefresh

*function*

Function called when table is refreshed.

## tableProps

*object*

Props passed to table component. In addition it is used to pass `actionResolver` props.
That will give you access to the row data, that way you can map through each row and enable/disable kebab action depending on the value. You cannot use both `actions` and `actionResolver` props - choose one.
Example in [Patchman UI](https://github.com/RedHatInsights/patchman-ui/blob/master/src/SmartComponents/Systems/Systems.js#L191)

## paginationProps

*object*

Props passed to paginations components.

## autoRefresh

*boolean*

When `true`, the table is refreshed when `customFilters` are changed.

## initialLoading

*boolean*

When `true`, the table is in loading state on mount until `entities.loaded` is set to `false` (and from that point, `loaded` is the only determinator.). Use when users can go back to already loaded table, this prop ensures that there will be no change from `loaded` > `loading` > `loaded`.

## ignoreRefresh

*boolean = true*

On the initial mount and when items/sortBy are changed, the inventoryTable ignores `onRefresh` prop. By setting the prop to false, you can control this behavior.

## showTagModal

*boolean*

Will enable TagModal even the filter or the column is not shown.

## fetchCustomOSes

*falsy | (apFilters) => array*

Operating systems filter by default fetches the os versions from inventory API. However, there might be requirement to fetch from some other custom API endpoints. In this case, you can provide your custom operating system API fetch funtion as a prop. The returned result must be in the shape of:

```
  {
      "total": Number,
      "count": Number,
      "page": Number,
      "per_page": Number,
      "results": [
          {
              "value": {
                  "name": String,
                  "major": Number,
                  "minor": Number,
              },
              "count": Number
          },
      ]
  }
```

## lastSeenOverride
*string*

Overrides the "Last Seen" column to use the specified `key` and `sortKey` instead of the default `updated` value. Also ensures proper handling when the default sorting is set to `updated`.
