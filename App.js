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
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {createStackNavigator, NavigationEvents} from 'react-navigation';
import {withMappedNavigationProps} from 'react-navigation-props-mapper';
import ImagePicker from 'react-native-image-picker';

type Props = {};


const default_region = {
  latitude: 45.00,
  longitude: 0.00,
  latitudeDelta: 0.003,
  longitudeDelta: 0.003,
};



class MapScreen extends Component<Props> {
  constructor(props){
    super(props);

    this.state = {
      pothole: null,
      region: {...default_region},
    };
  }

  static navigationOptions = ({navigation}) => ({
    headerTitle: <Text style={{fontSize: 16, margin: 10}}>PotholeCoin</Text>,
    headerRight: (
      <View style={{margin: 10}}>
        <Button
          title='New Pothole'
          onPress={() => {
            navigation.navigate('NewPothole', {
              update_map_screen: navigation.getParam('update_map_screen', () => {}),
            });
          }}
        />
      </View>
    ),
  });

  componentDidMount() {
    this.props.navigation.setParams({update_map_screen: (region) => {
      this.setState({region});
      this.forceUpdate();
    }});
  }

  async move_to_location() {
    let granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)

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
  }

  render() {

    const mainmap = (
      <MapView
        style={{flex: 8}}
        onRegionChangeComplete={(region) => {
          this.setState({region});
        }}
        region={this.state.region}
        showsUserLocation={true}
        loadingEnabled={true}
        // TODO: this is apparently set after the map is rendered, so button doesn't show
        // until a re-rending... and ofcourse there's no way to force a re-rendering.
        showsMyLocationButton={true}
        onMapReady={() => {this.move_to_location();}}
        onPress={() => {
          this.setState({pothole: null});
        }}
      >
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
      </MapView>
    );

    let {pothole} = this.state;

    const footer = (pothole === null) ? (
      <Text style={{
        fontSize: 12,
        textAlign: 'center',
        margin: 5,
      }}>
        Select a pothole to crowdfund repairs.
      </Text>
    ) : (
      <View style={{
        fontSize: 12,
        textAlign: 'auto',
        margin: 5,
      }}>
        <Text style={{fontWeight: 'bold'}}>Pothole: {fprice(pothole.contributions)} funded / {fprice(pothole.expected_cost)} expected to fix</Text>
        <View style={{flexDirection: 'row', margin: 2}}>
          <Image
            resizeMode='cover'
            style={styles.thumbnails}
            source={{uri: pothole.pictures[0].uri}}
          />
          <Text
            style={{flex: 3, textAlign: 'justify', marginLeft: 5}}
            numberOfLines={5}
          >
            {pothole.description}
          </Text>
        </View>
        <View style={{flexDirection: 'row', margin: 2}}>
          <View style={{flex: 2}}>
            <Button
              title='Contribute'
              onPress={() => {}}
              color={state_colors.funding}
            />
          </View>
          <View style={{flex: 2}}>
            <Button
              title='Fix'
              onPress={() => {}}
              color={state_colors.fixing}
            />
          </View>
          <View style={{flex: 1}}>
            <Button
              title='...'
              onPress={() => {}}
            />
          </View>
        </View>
      </View>
    );

    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#FFF',
      }}>
        {mainmap}
        {footer}
      </View>
    );
  }
}

const default_cost = 40;

@withMappedNavigationProps()
class NewPotholeScreen extends Component<Props> {
  constructor(props){
    super(props);

    this.state = {
      // TODO: maybe a better default is the region of the previous map.
      region: {...default_region},
      pothole_position: null,
      pothole_pics: [],
      pothole_description: '',
      pothole_cost: {value: default_cost, unit: 'USD'},
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
        justifyContent: 'center',
        backgroundColor: '#FFF',
      }}>
        <MapView
          style={{flex: 3}}
          onMapReady={() => this.get_initial_position()}
          onRegionChangeComplete={(region) => {
            this.setState({region});
          }}
          region={this.state.region}
          showsUserLocation={true}
          loadingEnabled={true}
          // TODO: this is apparently set after the map is rendered, so button doesn't show
          // until a re-rending... and ofcourse there's no way to force a re-rendering.
          showsMyLocationButton={true}
          onPress={(event) => {
            let {latitude, longitude} = event.nativeEvent.coordinate;
            this.setState({pothole_position: {latitude, longitude}});
          }}
        >
        {(this.state.pothole_position !== null) &&
          <Marker
            coordinate={this.state.pothole_position}
            pinColor={state_colors.funding}
            title={'Pothole'}
            description={'Set position.'}
            draggable
            onDragEnd={event => {
              let {latitude, longitude} = event.nativeEvent.coordinate;
              this.setState({pothole_position: {latitude, longitude}});
            }}
          />
        }
        </MapView>
        <View style={{flex: 5, margin: 10}}>
        <ScrollView>
          <View style={styles.thumbnails_container}>
            <ScrollView horizontal={true}>
              {(this.state.pothole_pics.length === 0) ? (
                <Image
                  source={require('./img/nophoto.png')}
                  style={styles.thumbnails}
                />
              ) : (
                this.state.pothole_pics.map(pic => (
                  <Image
                    source={{uri: pic.uri}}
                    style={styles.thumbnails}
                    key={pic.index}
                  />
                ))
              )}
            </ScrollView>
          </View>
          <Button
            title='Take picture'
            onPress={()=>{

              const options = {
                title: 'Pothole Picture',
                mediaType: 'photo',
                quality: 0.8,
                storageOptions: {
                  skipBackup: true,
                  path: 'PotholeCoin',
                },
              };

              ImagePicker.launchCamera(options, (response) => {
                if (response.didCancel) {
                  console.log('User cancelled image picker');
                } else if (response.error) {
                  console.log('ImagePicker Error: ', response.error);
                } else {
                  const prev_pics = this.state.pothole_pics;

                  const pic = {
                    uri: 'data:image/jpeg;base64,' + response.data,
                    index: prev_pics.length,
                  };

                  this.setState({
                    pothole_pics: [...prev_pics, pic],
                  })
                }
              });

            }}
          />
          <TextInput
            placeholder="What's the problem?"
            onChangeText={(text) => {}}
            multiline={true}
            numberOfLines={5}
            maxLength={500}
            onChangeText={(text) => {
              this.setState({pothole_description: text});
            }}
          />
          <Text>How big is the hole? Rough cost to fix: {fprice(this.state.pothole_cost)}</Text>
          <View style={{flexDirection: 'row'}}>
            <Text>Small</Text>
            <Slider
              minimumValue={20}
              maximumValue={200}
              step={10}
              value={default_cost}
              style={{flex: 1}}
              onValueChange={(value) => {
                this.setState({pothole_cost: {value, unit: 'USD'}});
              }}
            />
            <Text>Large</Text>
          </View>
        </ScrollView>
        </View>
        <Button
          title='Submit'
          onPress={() => {
            if (this.state.pothole_position === null) {
              return Alert.alert('No Position', 'Please press on the map to pick set the location.');
            }

            if (this.state.pothole_pics.length === 0) {
              return Alert.alert('No Picture', 'Please take at least a picture of the pothole.');
            }

            potholes.push({
              id: `pothole ${potholes.length}`,
              position: this.state.pothole_position,
              time: new Date(),
              description: this.state.pothole_description,
              owner: 'Mr Potter', // TODO: need a login page
              state: 'funding',
              state_info: {},
              pictures: this.state.pothole_pics,
              expected_cost: this.state.pothole_cost,
              contributions: {value: 0, unit: this.state.pothole_cost.unit},
              payments: [],
              comments: [],
            });


            this.props.update_map_screen(this.state.region);
            this.props.navigation.navigate('Map');
          }}
          style={{position: 'absolute', bottom: 0}}
        />
      </View>
    );
  }
}

// Screens:
// 1. [v] map and quick view
// 2. [v] new pothole (location, upload pics, write description, estimate cost)
// 3. [ ] existing pothole (location, pics, description, comments, post comment, contribute, fix)
// 4. [ ] contribute page (mock with just a number to type in)
// 5. [ ] login page (mock accepting any user with any password)
// 6. [ ] fix page (mock with a date of expected to fix, or picture of it fixed)


const App = createStackNavigator(
  {
    Map: MapScreen,
    NewPothole: NewPotholeScreen,
  },
  {
    initialRouteName: 'Map',
  });

export default App;


const styles = StyleSheet.create({
  thumbnails_container: {
    height: 130,
  },
  thumbnails: {
    height: 120, width: 120, resizeMode: 'contain', margin: 5,
  },
});

const state_colors = {
  'funding': 'orange',
  'funded': 'red',
  'fixing': 'aqua',
  'fixed': 'navy',
}

function fprice({value, unit}) {
  if (unit !== 'USD') throw `Not supporting ${unit} yet.`;

  return `\$${value.toFixed(0)}`;
};


// Test data
// ---------

let potholes = [
  {
    id: 'insert uuid here',
    position: {latitude: 37.78, longitude: -122.44},
    time: new Date('2017-12-16T03:24:00Z'),
    description: "Hole in the street; plz fix. My car ran into it, now it broken, the front fell off. Wheels in the ditch. Pothole very big, such problem wow, this amount of text will it overflow, i don't know, the pothole will though. Overflow with fresh hot asphalt.",
    owner: 'CM',
    state: 'fixing',
    state_info: {
      fixer: 'Cement Co',
      bid: {value: 200, unit: 'USD'},
      expected_time: new Date('2017-12-19T03:24:00Z'),
      deadline: new Date('2018-01-19T03:24:00Z'),
    },
    pictures: [
      {
        uri: 'https://patch.com/img/cdn20/users/22821259/20180112/071633/styles/T800x600/public/processed_images/newport_whitepit_lane_pot_hole-1515802556-4418.jpg?width=700',
        index: 0,
      },
    ],
    expected_cost: {value: 300, unit: 'USD'},
    contributions: {value: 200, unit: 'USD'},
    payments: [
      {user: 'CM', value: 150, unit: 'USD', reference: 'The one'},
      {user: 'Zoolander', value: 50, unit: 'USD', reference: '2'},
    ],
    comments: [
      {user: 'CM', text: 'Needs more filling', role: 'contributor', time: new Date('2017-12-17T03:24:00Z')},
      {user: 'Other', text: 'Yep, car broke', role: 'passerby', time: new Date('2017-12-17T04:24:00Z')},
      {user: 'Cement Co', text: 'Coming to fix it on Monday', role: 'fixer', time: new Date('2017-12-18T03:24:00Z')},
    ],
  }

];