import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from '../server/pages';
import { union, get } from 'lodash';
import { prettyUrl} from '../lib/utils';
import { Router } from '../server/pages';
import Currency from './Currency';
import { defaultBackgroundImage } from '../constants/collectives';
import { pickAvatar } from '../lib/collective.lib';

class CollectiveCover extends React.Component {

  static propTypes = {
    href: PropTypes.string,
    title: PropTypes.string,
    style: PropTypes.object,
  }

  render() {
    const {
      collective,
      className,
      title,
      href
    } = this.props;

    const {
      description,
      type,
      website,
      twitterHandle,
      members,
      stats
    } = collective;

    const backgroundImage = collective.backgroundImage || get(collective,'parentCollective.backgroundImage') || defaultBackgroundImage[collective.type];
    const customStyles = get(collective, 'settings.style.hero.cover') || get(collective.parentCollective, 'settings.style.hero.cover');
    const style = {
      backgroundImage: `url('${backgroundImage}')`,
      backgroundPosition: collective.type === 'COLLECTIVE' ? 'center center' : 'center -40px',
      backgroundSize: 'cover',
      ...customStyles
    };

    const logo = collective.image || get(collective.parentCollective, 'image');

    let membersPreview = [];
    if (members) {
      const admins = members.filter(m => m.role === 'ADMIN');
      const contributors = members.filter(m => m.role === 'CONTRIBUTOR');
      const backers = members.filter(m => m.role === 'BACKER');
      backers.sort((a, b) => b.totalDonations - a.totalDonations);
      membersPreview = union(admins, contributors, backers).slice(0, 5);
    }

    return (
      <div className={`CollectiveCover ${className} ${type}`}>
        <style jsx>{`
        .cover {
          display: flex;
          align-items: center;
          position: relative;
          text-align: center;
          min-height: 400px;
          width: 100%;
          overflow: hidden;
        }
        .small .cover {
          height: 200px;
          min-height: 200px;
        }
        .small .description, .small .contact, .small .stats, .small .members {
          display: none;
        }
        .backgroundCover {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .content {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          color: black;
          margin-top: 70px;
        }
        .small .content {
          margin-top: 0px;
        }
        .content a {
          color: black;
        }
        .USER .cover {
          display: block;
        }
        .COLLECTIVE .content {
          margin-top: 0px;
        }
        .COLLECTIVE .content, .COLLECTIVE .content a {
          color: white;
        }
        .logo {
          max-width: 20rem;
          max-height: 10rem;
          margin: 0 auto;
          display: block;
        }
        .USER .logo {
          border: 3px solid #fff;
          box-shadow: 0 0 0 2px #75cc1f;
          border-radius: 50%;
          margin: 3rem auto;
        }
        .USER.small .logo {
          margin: 2rem auto;
        }
        h1 {
          font-size: 3rem;
          margin: 0;
        }
        .contact {
          display: flex;
          flex-direction: row;
          justify-content: center
        }
        .contact div {
          margin: 1rem;
        }
        .members {
          display: flex;
          justify-content: center;
          margin: 2rem 0;
        }
        .avatar {
          float: left;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          margin: 0 0.5rem;
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px #75cc1f;
        }
        .MoreBackers {
          font-size: 2rem;
          line-height: 36px;
          margin-left: 1rem;
        }
        .stats {
          font-size: 1.3rem;
        }
        .stats .value {
          font-size: 3rem;
        }

        @media(max-width: 600px) {
          h1 {
            font-size: 2.5rem;
          }
        }
        `}</style>
        <div className="cover">
          <div className="backgroundCover" style={style} />
          <div className="content">
            <Link route={href}><a><img src={logo} className="logo" /></a></Link>
            <h1>{title}</h1>
            { description && <p className="description">{description}</p> }
            { (twitterHandle || website) &&
              <div className="contact">
                { twitterHandle && <div className="twitterHandle"><a href={`https://twitter.com/${twitterHandle}`} target="_blank">@{twitterHandle}</a></div> }
                { website && <div className="website"><a href={website} target="_blank">{prettyUrl(website) }</a></div> }
              </div>
            }
            { membersPreview.length > 0 &&
              <div className="members">
                { membersPreview.map(member => (
                  <a onClick={() => Router.pushRoute(`/${member.member.slug}`)} title={`${member.member.name} ${member.description || member.member.description || ''}`} key={member.member.slug}>
                    <div className="avatar" style={{ backgroundImage: `url(${member.member.image || pickAvatar(member.member.id)})`}}></div>
                  </a>
                ))}
                { membersPreview.length < members.length &&
                  <div className="MoreBackers">
                    + {members.length - membersPreview.length}
                  </div>
                }
              </div>
            }
            { stats && stats.yearlyBudget > 0 &&
              <div className="stats">
                <div className="yearlyBudget value">
                  <Currency value={stats.yearlyBudget} currency={collective.currency} />
                </div>
                <FormattedMessage id="collective.stats.yearlyBudget.label" defaultMessage="Estimated annual budget based on current donations" />
              </div>
            }
            { stats && stats.totalAmountSent > 0 &&
              <div className="stats">
                <div className="totalAmountSent value">
                  <Currency value={stats.totalAmountSent} currency={collective.currency} />
                </div>
                <FormattedMessage id="collective.stats.totalAmountSent.label" defaultMessage="Total amount donated" />
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default CollectiveCover;