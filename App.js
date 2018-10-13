/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Button,
  PermissionsAndroid,
  TextInput,
  Slider,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {createStackNavigator} from 'react-navigation';
import {withMappedNavigationProps} from 'react-navigation-props-mapper';

type Props = {};


const default_region = {
  latitude: 45.00,
  longitude: 0.00,
  latitudeDelta: 0.003,
  longitudeDelta: 0.003,
};



class MapViewWrapper extends MapView {
  constructor(props){
    super(props);

    this.state = {
      // Copy of the default values.
      region: {...default_region},
    }
  }

  componentWillMount() {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      .then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              let {latitude, longitude} = position.coords;
              this.setState({region: {...this.state.region, latitude, longitude}});
            },
            (error) => {
              console.warning(`Error getting location: ${error}`);
            },
            {
              timeout: 30 * 1000,
              enableHighAccuracy: true,
            }
          )
        }
        else {
          // TODO: what do we do when location isn't granted?
          console.warning(`Location not granted: ${granted}`);
        }
      });
  }


  render() {
    return (
      <MapView
        region={this.state.region}
        showsUserLocation={true}
        loadingEnabled={true}
        // TODO: this is apparently set after the map is rendered, so button doesn't show
        // until a re-rending... and ofcourse there's no way to force a re-rendering.
        showsMyLocationButton={true}
        {...this.props}
      />
    );
  }
}


class MapScreen extends Component<Props> {
  constructor(props){
    super(props);

    this.state = {pothole: null};
  }

  static navigationOptions = ({navigation}) => ({
    headerTitle: <Text style={{fontSize: 16, margin: 10}}>PotholeCoin</Text>,
    headerRight: (
      <View style={{margin: 10}}>
        <Button
          title="New Pothole"
          onPress={() => {
            navigation.navigate("NewPothole");
          }}
        />
      </View>
    ),
  });

  render() {

    const main = (
      <MapViewWrapper style={{flex: 8}}>
      {potholes.map(pothole => (
        <Marker
          key={pothole.id}
          coordinate={pothole.position}
          pinColor={state_colors[pothole.state]}
          title={`Pothole: ${fprice(pothole.contributions)}/${fprice(pothole.expected_cost)}`}
          description={pothole.description}
          onPress={(state) => this.setState({...state, pothole: pothole})}
        />
      ))}
      </MapViewWrapper>
    );

    let {pothole} = this.state;

    const footer = (pothole === null) ? (
      <Text style={{
        fontSize: 12,
        textAlign: "center",
        margin: 5,
      }}>
        Select a pothole to crowdfund repairs.
      </Text>
    ) : (
      <View style={{
        fontSize: 12,
        textAlign: "auto",
        margin: 5,
      }}>
        <Text style={{fontWeight: "bold"}}>Pothole: {fprice(pothole.contributions)} funded / {fprice(pothole.expected_cost)} expected to fix</Text>
        <View style={{flexDirection: "row", margin: 2, maxHeight: 80}}>
          <Image
            resizeMode="cover"
            style={{flex: 1}}
            source={{uri: pothole.pictures[0].url}}
          />
          <Text
            style={{flex: 3, textAlign: "justify", marginLeft: 5}}
            numberOfLines={5}
          >
            {pothole.description}
          </Text>
        </View>
        <View style={{flexDirection: "row", margin: 2}}>
          <View style={{flex: 2}}>
            <Button
              title="Contribute"
              onPress={() => {}}
              color={state_colors.funding}
            />
          </View>
          <View style={{flex: 2}}>
            <Button
              title="Fix"
              onPress={() => {}}
              color={state_colors.fixing}
            />
          </View>
          <View style={{flex: 1}}>
            <Button
              title="..."
              onPress={() => {}}
            />
          </View>
        </View>
      </View>
    );

    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#FFF",
      }}>
        {main}
        {footer}
      </View>
    );
  }
}


class NewPotholeScreen extends Component<Props> {
  constructor(props){
    super(props);

    this.state = {
      // TODO: maybe a better default is the region of the previous map.
      region: {...default_region},
      pothole_position: null,
    };
  }

  static navigationOptions = {
    headerTitle: <Text style={{fontSize: 16, margin: 10}}>Report New Pothole</Text>
  };

  get_initial_position(){
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let {latitude, longitude} = position.coords;
        this.setState({
          region: {...this.state.region, latitude, longitude},
          pothole_position: {latitude, longitude},
        });
      },
      (error) => {
        console.warning(`Error getting location: ${error}`);
        // Eh, just set it to center of the region.
        let {latitude, longitude} = this.state.region;
        this.setState({pothole_position: {latitude, longitude}});
      },
      {
        timeout: 3 * 1000,
        enableHighAccuracy: true,
      }
    );
  }

  render() {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#FFF",
      }}>
        <MapViewWrapper
          style={{flex: 3}}
          onMapReady={() => this.get_initial_position()}
          region={this.state.region}
        >
        {(this.state.pothole_position !== null) &&
          <Marker
            coordinate={this.state.pothole_position}
            pinColor={state_colors.funding}
            title={"Pothole"}
            description={"Set position."}
            draggable
            onDragEnd={event => {
              let {latitude, longitude} = event.nativeEvent.coordinate;
              this.setState({pothole_position: {latitude, longitude}});
            }}
          />
        }
        </MapViewWrapper>
        <View style={{flex: 4, margin: 10}}>
          <View style={styles.thumbnails_container}>
            <ScrollView horizontal={true}>
              <Image
                source={require("./img/nophoto.png")}
                style={styles.thumbnails}
              />
            </ScrollView>
          </View>
          <Button
            title="Take picture"
            onPress={()=>{}}
          />
          <TextInput
            placeholder="What's the problem?"
            onChangeText={(text) => {}}
            multiline={true}
            numberOfLines={5}
            maxLength={500}
          />
          <Text>How big is the hole? Rough cost to fix: {fprice({value: 40, unit: "USD"})}</Text>
          <View style={{flexDirection: "row"}}>
            <Text>Small</Text>
            <Slider
              minimumValue={20}
              maximumValue={200}
              step={10}
              value={40}
              style={{flex: 1}}
            />
            <Text>Large</Text>
          </View>
        </View>

        <Button
          title="Submit"
          onPress={() => {}}
          style={{position: "absolute", bottom: 0}}
        />
      </View>
    );
  }
}

// Screens:
// 1. map and quick view
// 2. new pothole (location, upload pics, write description, estimate cost)
// 3. existing pothole (location, pics, description, comments, post comment, contribute, fix)
// 4. contribute page (mock with just a number to type in)
// 5. login page (mock accepting any user with any password)


const App = createStackNavigator(
  {
    Map: MapScreen,
    NewPothole: NewPotholeScreen,
  },
  {
    initialRouteName: "Map",
  });

export default App;


const styles = StyleSheet.create({
  thumbnails_container: {
    height: 130,
  },
  thumbnails: {
    height: 120, width: 120, resizeMode: "contain", margin: 5,
  },
});

const state_colors = {
  "funding": "orange",
  "funded": "red",
  "fixing": "aqua",
  "fixed": "navy",
}

function fprice({value, unit}) {
  if (unit !== "USD") throw `Not supporting ${unit} yet.`;

  return `\$${value.toFixed(0)}`;
};


// Test data
// ---------

potholes = [
  {
    id: "insert uuid here",
    position: {latitude: 37.78, longitude: -122.44},
    time: new Date("2017-12-16T03:24:00Z"),
    description: "Hole in the street; plz fix. My car ran into it, now it broken, the front fell off. Wheels in the ditch. Pothole very big, such problem wow, this amount of text will it overflow, i don't know, the pothole will though. Overflow with fresh hot asphalt.",
    owner: "CM",
    state: "fixing",
    state_info: {
      fixer: "Cement Co",
      bid: {value: 200, unit: "USD"},
      expected_time: new Date("2017-12-19T03:24:00Z"),
      deadline: new Date("2018-01-19T03:24:00Z"),
    },
    pictures: [
      {
        info: "main pic",
        url: "https://patch.com/img/cdn20/users/22821259/20180112/071633/styles/T800x600/public/processed_images/newport_whitepit_lane_pot_hole-1515802556-4418.jpg?width=700",
        index: 0,
      },
    ],
    expected_cost: {value: 300, unit: "USD"},
    contributions: {
      value: 200, unit: "USD",
      payments: [
        {user: "CM", value: 150, unit: "USD", reference: "The one"},
        {user: "Zoolander", value: 50, unit: "USD", reference: "2"},
      ],
    },
    comments: [
      {user: "CM", text: "Needs more filling", role: "contributor", time: new Date("2017-12-17T03:24:00Z")},
      {user: "Other", text: "Yep, car broke", role: "passerby", time: new Date("2017-12-17T04:24:00Z")},
      {user: "Cement Co", text: "Coming to fix it on Monday", role: "fixer", time: new Date("2017-12-18T03:24:00Z")},
    ],
  }

];