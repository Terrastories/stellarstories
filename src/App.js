import React, { Component } from 'react';

import bbox from "@turf/bbox";
import center from "@turf/center";
import bboxPolygon from '@turf/bbox-polygon'

import CelestialMap from './CelestialMap';
import Card from './Card';
import IntroPopup from "./IntroPopup";

import logo from './assets/images/stellarstories.png';
import sampleStories from './assets/samplestories';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      framedView: null, // store information about how view should be laid out
      points: {},
      sourceStories: sampleStories,
      stories: sampleStories,
      activePoint: null,
      activeStory: null,
      filterOptions: ["Name", "Type of Celestial Body", "Speaker", "Topic", "Language", "Speaker Community"],
      filterCategory: "Select category",
      filterItem: "Select option",
      itemOptions: [],
      zoom: 1.25,
      centerLong: -120,
      centerLat: -35,
      logoPath: logo
    };
  }

  componentDidMount() {
    const points = this.getPointsFromStories(this.state.stories);
    this.setState({ points: points });
  }

  getPointsFromStories = stories => {
    //get unique points only
    const points = stories.reduce((accumulator, story) => {
      story.points.map(storyPoint => {
        if (!accumulator.some(point => point.id === storyPoint.id)) {
          accumulator.push(storyPoint);
        }
      });
      return accumulator;
    }, []);

    const pointObj = {
      type: "FeatureCollection",
      features: points
    };
    return pointObj;
  };

  filterMap = () => {
    // Build Filter Map for Dropdowns
    // {category name: array of items}
    let filterMap = {};
    this.state.filterOptions.sort().map(category => {
      switch (category) {
        case "Name": {
          // first category: Name
          const regionSet = new Set(
            this.state.sourceStories
              .map(story => {
                return story.points.map(point => point.properties.region);
              })
              .flat()
          );
          filterMap[category] = Array.from(regionSet).filter(item => item).sort();
          break;
        }
        case "Type of Celestial Body": {
          // second category: Type of Celestial Body
          const typeOfPlaceSet = new Set(
            this.state.sourceStories
              .map(story => {
                return story.points.map(
                  point => point.properties.type_of_place
                );
              })
              .flat()
          );
          filterMap[category] = Array.from(typeOfPlaceSet).filter(item => item).sort();
          break;
        }
        case "Speaker": {
          // third category: Speaker
          const speakerSet = new Set(
            this.state.sourceStories
              .map(story => {
                return story.speakers.map(speaker => speaker.name);
              })
              .flat()
          );
          filterMap[category] = Array.from(speakerSet).filter(item => item).sort();
          break;
        }
        case "Topic": {
          // fourth category: Topic
          const topicSet = new Set(
            this.state.sourceStories
              .map(story => story.topic)
              .flat()
          );
          filterMap[category] = Array.from(topicSet).filter(item => item).sort();
          break;
        }
        case "Language": {
          // fifth category: Language
          const languageSet = new Set(
            this.state.sourceStories
              .map(story => story.language)
              .flat()
          );
          filterMap[category] = Array.from(languageSet).filter(item => item).sort();
          break;
        }
        case "Speaker Community": {
          // sixth category: Speaker Community
          const communitySet = new Set(
            this.state.sourceStories
            .map(story => {
              return story.speakers.map(speaker => speaker.speaker_community);
            })
            .flat()
          );
          filterMap[category] = Array.from(communitySet).filter(item => item).sort();
          break;
        }
      }
    });
    return filterMap;
  };

  handleFilter = (category, item) => {
    let filteredStories = [];
    switch (category) {
      case "Name": {
        // first category: Name
        filteredStories = this.state.sourceStories.filter(story => {
          if (
            story.points.some(point => {
              return (
                point.properties.region &&
                point.properties.region.toLowerCase() === item.toLowerCase()
              );
            })
          ) {
            return story;
          }
        });
        break;
      }
      case "Type of Celestial Body": {
        // second category: type of celestial body
        filteredStories = this.state.sourceStories.filter(story => {
          if (
            story.points.some(point => {
              return (
                point.properties["type_of_place"] &&
                point.properties["type_of_place"].toLowerCase() ===
                  item.toLowerCase()
              );
            })
          ) {
            return story;
          }
        });
        break;
      }
      case "Speaker": {
        // third category: speaker name
        filteredStories = this.state.sourceStories.filter(story => {
          if (
            story.speakers.some(speaker => {
              return (
                speaker.name &&
                speaker.name.toLowerCase() === item.toLowerCase()
              );
            })
          ) {
            return story;
          }
        });
        break;
      }
      case "Topic": {
        // fourth category: topic
        filteredStories = this.state.sourceStories.filter(story => {
            if (story.topic) {
              return (
                story.topic &&
                story.topic.toLowerCase() === item.toLowerCase()
              )
            }
        });
        break;
      }
      case "Language": {
        // fifth category: language
        filteredStories = this.state.sourceStories.filter(story => {
            if (story.language) {
              return (
                story.language &&
                story.language.toLowerCase() === item.toLowerCase()
              )
            }
        });
        break;
      }
      case "Speaker Community": {
        // sixth category: community
        filteredStories = this.state.sourceStories
          .filter((story) => story.speakers
            .some(speaker => speaker.speaker_community && speaker.speaker_community.toLowerCase() === item.toLowerCase())
          )
          .map(story => {
            let n = Object.assign({}, story)
            n.speakers = n.speakers
              .filter(speaker => speaker.speaker_community && speaker.speaker_community.toLowerCase() === item.toLowerCase())
              return n
            });
        break;
      }
    }
    if (filteredStories) {
      const filteredPoints = this.getPointsFromStories(filteredStories);

      const bounds = bbox(filteredPoints);
      const bboxPoly = bboxPolygon(bounds);
      const centerPoint = center(bboxPoly).geometry.coordinates;
      const framedView = {
        center: [centerPoint[0], centerPoint[1], 0]
      };

      var activePoint = this.state.activePoint;
      if (activePoint && !filteredPoints.features.some(point => point.id === activePoint.id)) {
          activePoint = null;
      }

      this.setState({
        stories: filteredStories,
        points: filteredPoints,
        framedView,
        activePoint
      });
    }
  };

  handleFilterCategoryChange = option => {
    if (option === null) {
      this.resetStoriesAndMap();
    } else {
      const category = option.value;
      this.setState({ filterCategory: category, itemOptions: this.filterMap()[category] })
    }
  }

  handleFilterItemChange = option => {
    if (option === null) {
      this.resetStoriesAndMap();
    } else if (this.state.filterCategory !== null) {
      const item = option.value;
      this.handleFilter(this.state.filterCategory, item);
      this.setState({ filterItem: item });
    }
  }

  showMapPointStories = stories => {
    let storyTitles = stories.map(story => story.title);
    let filteredStories = [];
    filteredStories = this.state.sourceStories.filter(story =>
      storyTitles.includes(story.title)
    );
    if (filteredStories) {
      this.setState({
        stories: filteredStories,
        activeStory: filteredStories[0]
      });
    }
  };

  handleStoriesChanged = stories => {
    this.setState({ stories: stories });
  };

  handleStoryClick = story => {
    // set active to first point in story
    const point = story.points[0];
    const framedView = { center: [point.geometry.coordinates[0], point.geometry.coordinates[1], 0] };
    this.setState({ activePoint: point, activeStory: story, framedView });
  };

  resetStoriesAndMap = () => {
    const points = this.getPointsFromStories(sampleStories);
    this.setState({
      stories: sampleStories,
      points: points,
      framedView: { center: [this.state.centerLong, this.state.centerLat, 0]},
      activePoint: null,
      activeStory: null,
      filterCategory: "Select category",
      filterItem: "Select option",
      itemOptions: [],
    });
  };

  // build category list based that excludes empty category sets
  buildFilterCategories = () => {
    const variableCategories = this.state.filterOptions;
    let categories = this.filterMap();

    Object.keys(categories).map(cat => {
      if (categories[cat].length === 0 && variableCategories.includes(cat)) {
        delete categories[cat]
      }
    })
    let filteredCategories = Object.keys(categories)
    return filteredCategories
  }

  render() {
    return (
      <React.Fragment>
        <CelestialMap
          points={this.state.points}
          clearFilteredStories={this.resetStoriesAndMap}
          activePoint={this.state.activePoint}
          framedView={this.state.framedView}
          centerLat={this.state.centerLat}
          centerLong={this.state.centerLong}
          zoom={this.state.zoom}
        />
        <Card
          activeStory={this.state.activeStory}
          stories={this.state.stories}
          handleStoriesChanged={this.handleStoriesChanged}
          categories={this.buildFilterCategories()}
          filterMap={this.filterMap()}
          handleFilter={this.handleFilter}
          clearFilteredStories={this.resetStoriesAndMap}
          onStoryClick={this.handleStoryClick}
          logo_path={this.state.logoPath}
          filterCategory={this.state.filterCategory}
          filterItem={this.state.filterItem}
          handleFilterCategoryChange={this.handleFilterCategoryChange}
          handleFilterItemChange={this.handleFilterItemChange}
          itemOptions={this.state.itemOptions}
        />
        <IntroPopup />
      </React.Fragment>
    );
  }
}

export default App;