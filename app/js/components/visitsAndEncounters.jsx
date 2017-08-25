/* * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import React from 'react';
import apiCall from '../utilities/apiHelper';
import { Table } from 'reactstrap';
import { withRouter } from 'react-router'

class VisitsAndEncounters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: this.props.uuid,
      visits: [],
      encounters: {},
      showEncounters: {},
      expanded: false
    };
    this.handleVisitClick = this.handleVisitClick.bind(this)
    this.handleShowMore = this.handleShowMore.bind(this)
    this.handleData = this.handleData.bind(this)
    this.handleEncounterClick = this.handleEncounterClick.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.uuid !== this.props.uuid) {
      this.setState({
        uuid: this.props.uuid
      })

    }
  }

  componentDidMount() {
    apiCall(null, 'get', `/visit?patient=${this.state.uuid}`)
      .then((res) => {
        let visits = res.results;
        const getVisits = visits.map(visit => apiCall(null, 'get', `/visit/${visit.uuid}`))

        return Promise.all(getVisits).then(data => {
          this.setState({ visits: data, encounters: this.handleData(data) });
          return data;
        })
        .catch(error => toastr.error(error));
      })
      .catch(error => toastr.error(error));
  }

  handleData(data) {
    let encounters = {};
    data.forEach(visit => {
      encounters[visit.uuid] = visit.encounters;
    });
    return encounters;
  }

  handleVisitClick(visituuid) {
    this.props.router.push(`/patient/${this.state.uuid}/visit/${visituuid}`)
  }
  handleEncounterClick(encounteruuid) {
    this.props.router.push(`/patient/${this.state.uuid}/encounter/${encounteruuid}`)
  }

  handleShowMore(encounter, id) {
    this.setState(({ showEncounters }) => ({
      showEncounters: Object.assign({}, showEncounters, {
        [id]: {
          id,
          length: encounter.length
        }
      }),
       expanded: !this.state.expanded
    })
    )

  }
  render() {
    return (
      <div>
        <Table hover>
          <thead>
            <tr>
              <th>Visit Type</th>
              <th>Location</th>
              <th>Start Date</th>
              <th>Stop Date</th>
              <th>Encounters</th>
            </tr>
          </thead>
          <tbody>
            {this.state.visits.map((visit) => {
              const showEncounter = this.state.showEncounters[visit.uuid]
              const endIndex = showEncounter ? showEncounter.length : 5;
              return (
                <tr>
                  <a><td name="visituuid" onClick={() => this.handleVisitClick(visit.uuid)} value={visit.uuid}>{visit.display}</td></a>
                  <td>{visit.location.display}</td>
                  <td>{new Date(visit.startDatetime).toString()}</td>
                  <td>{new Date(visit.stopDatetime).toString()}</td>
                <a><td>{this.state.encounters[visit.uuid].slice(0, endIndex).map(encounter =>(
                    <li name="encounteruuid" onClick={() => this.handleEncounterClick(encounter.uuid)}value={encounter.uuid}>{encounter.display}</li>
                    
                    ))
                    }
                    { (this.state.encounters[visit.uuid].length > 5)
                    ? <a onClick={() => this.handleShowMore(this.state.encounters[visit.uuid], visit.uuid)}> 
                     {this.state.expanded ? '' : ' Show more!'}
                    </a> 
                    : ''
                    }

                  </td></a>
                </tr>
              )}
            )}
          </tbody>
        </Table>
      </div>
    )
  }
}

export default withRouter(VisitsAndEncounters);