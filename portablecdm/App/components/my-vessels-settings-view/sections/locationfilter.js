import React, { Component } from 'react';
import { connect } from 'react-redux';

import { addFavoriteMyLocations } from '../../../actions';

import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    FlatList
} from 'react-native';

import {
    Text,
    SearchBar,
    List,
    ListItem,
    CheckBox,
    Button
} from 'react-native-elements';

import MiniHeader from '../../mini-header-view';
import colorScheme from '../../../config/colors';

class LocationFilter extends Component {
    state = {
        searchTerm: '',
        locations: this.props.locations,
        favoriteLocations: this.props.favoriteLocations,
    }

    search(locations, searchTerm) {
        return locations.filter(location => location.name.toUpperCase().includes(searchTerm.toUpperCase()) ||
            location.locationType.toUpperCase().includes(searchTerm.toUpperCase()) ||
            this.state.favoriteLocations.includes(location.URN)
        );
    }
/*
   bubbleSelectedToTop = (a, b) => {
        if (this.state.favoriteLocations.includes(a.URN)) {
            return -1;
        }
        if (this.state.favoriteLocations.includes(b.URN)) {
            return 1;
        }

        return 0;
    }

    componentWillMount() {
        // Make sure all selected locations are on top
        this.setState({ locations: this.state.locations.sort(this.bubbleSelectedToTop) });
    }
    */
    onDoneIconPressed() {
        const {
            limitFilter,
            selectedSortByIndex,
            selectedOrderByIndex,
            withinValue,
            selectedTimeIndex,
            onlyFetchActivePortCalls
        } = this.state;
        const {
            filters,
            updateMyPortCalls,
            bufferPortCalls,
            clearCache,
            filterChangeLimit,
            filterChangeSortBy,
            filterChangeOrder,
            filterChangeMyVesselList,
            filterChangeArrivingWithin,
            filterChangeDepartingWithin,
            filterClearArrivingDepartureTime,
            filterChangeOnlyFuturePortCalls
        } = this.props;

        // Limit
        filterChangeLimit(limitFilter);

        // Sort By (ARRIVAL_DATE | LAST_UPDATE)
        if (selectedSortByIndex == 0) filterChangeSortBy('ARRIVAL_DATE');
        if (selectedSortByIndex == 1) filterChangeSortBy('LAST_UPDATE');

        // Order
        if (selectedOrderByIndex === 0) filterChangeOrder('DESCENDING');
        if (selectedOrderByIndex === 1) filterChangeOrder('ASCENDING');

        // Arrival time/Departure time
        if (selectedTimeIndex === 2 || withinValue === 0) { // Don't filter in departure/arrival time
            filterClearArrivingDepartureTime();
        } else if (selectedTimeIndex === 1) { // departing from
            filterChangeDepartingWithin(withinValue);
        } else if (selectedTimeIndex === 0) { // arriving within
            filterChangeArrivingWithin(withinValue);
        } else {

        }

        // Filter for not showing old PortCalls
        filterChangeOnlyFuturePortCalls(onlyFetchActivePortCalls);

        // Vessel List
        filterChangeMyVesselList(this.state.vesselListFilter);

        // Stages


        clearCache();
        updateMyPortCalls()
            .then(bufferPortCalls);
        this.props.navigation.goBack();
    }

    render() {
        const { onBackPress, addFavoriteMyLocations } = this.props;
        const { locations } = this.state;

        return (
            <View style={styles.container}>
                <MiniHeader
                    modal
                    title="Select your locations"
                    leftIconFunction={onBackPress}
                    rightIconFunction={() => {
                        addFavoriteMyLocations(this.onDoneIconPressed)
                        onBackPress();
                    }}
                />
                <View style={styles.containerRow}>
                    <SearchBar
                        containerStyle={styles.searchBarContainer}
                        inputStyle={{ backgroundColor: colorScheme.primaryContainerColor }}
                        lightTheme
                        placeholder='Search by location name or type'
                        placeholderTextColor={colorScheme.tertiaryTextColor}
                        onChangeText={text => this.setState({ searchTerm: text })}
                        textInputRef='textInput'
                    />
                    <Button
                        title="Clear"
                        containerViewStyle={styles.clearButtonContainer}
                        textStyle={{ color: colorScheme.primaryTextColor }}
                        buttonStyle={{ backgroundColor: colorScheme.primaryColor }}
                        onPress={() => {
                            this.setState({ favoriteLocations: [] });
                        }}
                    />
                </View>

                <ScrollView>
                    {(locations.length <= 0) && <ActivityIndicator animating={!locations} size="large" style={{ alignSelf: 'center' }} />}
                    {(locations.length > 0) && <List>
                        {this.search(locations, this.state.searchTerm).map(location => {
                            return (
                                <ListItem
                                    key={location.URN}
                                    title={location.name}
                                    subtitle={`${location.locationType.replace(/_/g, " ")}`}
                                    rightIcon={<CheckBox
                                        checkedColor={colorScheme.primaryColor}
                                        checked={this.state.favoriteLocations.indexOf(location.URN) >= 0}
                                        containerStyle={{ backgroundColor: colorScheme.primaryTextColor, borderColor: colorScheme.primaryTextColor }}
                                        onPress={() => {
                                            const indexOfLocation = this.state.favoriteLocations.indexOf(location.URN);

                                            if (indexOfLocation < 0) {
                                                this.setState({ favoriteLocations: [...this.state.favoriteLocations, location.URN] });
                                            } else {
                                                this.setState({ favoriteLocations: this.state.favoriteLocations.filter((item, index) => index !== indexOfLocation) });
                                            }
                                        }}
                                    />}
                                    subtitleStyle={styles.subtitle}
                                />
                            );
                        })}
                    </List>}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 0,
        paddingRight: 0,
        backgroundColor: colorScheme.primaryColor
    },
    searchBarContainer: {
        backgroundColor: colorScheme.primaryColor,
        marginRight: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        flex: 4,
    },
    subtitle: {
        fontSize: 10,
    },
    clearButtonContainer: {
        flex: 1,
        marginRight: 0,
        marginLeft: 0,
        padding: 0
    },
});

function mapStateToProps(state) {
    return {
        locations: state.location.locations,
        loading: state.location.loading,
        favoriteLocations: state.favorites.mylocations
    }
}

export default connect(mapStateToProps, {
    addFavoriteMyLocations
})(LocationFilter);
