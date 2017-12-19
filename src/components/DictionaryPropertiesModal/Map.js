import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import styled from 'styled-components';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

const Wrapper = styled.div`
  width: 100%;
  height: 600px;
  border: 1px solid grey;
  border-radius: 2px;

  .leaflet {
    width: 100%;
    height: 100%;

    .point {
      display: flex;
      flex-direction: column;
      height: 2em !important;
      width: 2em !important;
      border-radius: 2px;
      border: 1px solid black;

      span {
        flex: 1 1 auto;

        &:not(:last-child) {
          border-bottom: 1px solid black;
        }
      }
    }
  }
`;

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeLocation = this.onChangeLocation.bind(this);
    this.markers = [];
  }

  componentDidMount() {
    this.leaflet = L.map(this.map, {}).setView([61.32, 60.82], 4);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.leaflet);

    this.leaflet.on('click', ({ latlng }) => this.onChangeLocation(latlng));
  }

  componentWillReceiveProps(props) {
    if (props.location) {
      const { lat, lng } = props.location;
      this.markers.push(L.marker([lat, lng]).addTo(this.leaflet));
    }
  }

  componentWillUnmount() {
    this.leaflet.remove();
  }

  onChangeLocation(latlng) {
    this.markers.forEach((m) => {
      this.leaflet.removeLayer(m);
    });

    this.markers.push(L.marker([latlng.lat, latlng.lng]).addTo(this.leaflet));
    this.props.onChange(latlng);
  }

  render() {
    return (
      <Wrapper>
        <div
          ref={(ref) => {
            this.map = ref;
          }}
          className="leaflet"
        />
      </Wrapper>
    );
  }
}

Map.propTypes = {
  onChange: PropTypes.func.isRequired,
  location: PropTypes.object,
};

Map.defaultProps = {
  location: null,
};

export default Map;
